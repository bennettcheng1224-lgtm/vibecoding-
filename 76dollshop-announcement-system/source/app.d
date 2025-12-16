import vibe.vibe;
import vibe.data.json;
import vibe.http.client;
import std.stdio;
import std.conv;
import std.algorithm;
import std.array;
import std.datetime;
import std.process : environment;
import std.file;
import std.string;
import std.uuid;

// ============================================================================
// 設定結構
// ============================================================================

struct Config {
    string googleClientId;
    string googleClientSecret;
    string googleRedirectUri;
    string googleSheetsId;
    string googleServiceAccountEmail;
    string googleServiceAccountKeyPath;
    string openaiApiKey;
    string[] allowedEmails;
    ushort serverPort;
    string sessionSecret;
}

Config config;
string[string] sessions; // 簡單的 Session 儲存（正式環境建議使用 Redis）
Json announcements = Json.emptyArray; // 暫存公告資料

// ============================================================================
// 載入環境設定
// ============================================================================

void loadConfig() {
    config.googleClientId = environment.get("GOOGLE_CLIENT_ID", "");
    config.googleClientSecret = environment.get("GOOGLE_CLIENT_SECRET", "");
    config.googleRedirectUri = environment.get("GOOGLE_REDIRECT_URI", "http://localhost:8080/auth/callback");
    config.googleSheetsId = environment.get("GOOGLE_SHEETS_ID", "");
    config.googleServiceAccountEmail = environment.get("GOOGLE_SERVICE_ACCOUNT_EMAIL", "");
    config.googleServiceAccountKeyPath = environment.get("GOOGLE_SERVICE_ACCOUNT_KEY_PATH", "./service-account-key.json");
    config.openaiApiKey = environment.get("OPENAI_API_KEY", "");

    auto emailsStr = environment.get("ALLOWED_EMAILS", "");
    if (emailsStr.length > 0) {
        config.allowedEmails = emailsStr.split(",");
    }

    config.serverPort = to!ushort(environment.get("SERVER_PORT", "8080"));
    config.sessionSecret = environment.get("SESSION_SECRET", "change-me-in-production");

    logInfo("Configuration loaded successfully");
}

// ============================================================================
// 使用者結構
// ============================================================================

struct User {
    string email;
    string name;
    string accessToken;
}

// ============================================================================
// 認證中介軟體
// ============================================================================

void requireAuth(HTTPServerRequest req, HTTPServerResponse res) {
    auto sessionId = req.cookies.get("session_id", "");

    if (sessionId !in sessions) {
        res.redirect("/login");
        return;
    }

    auto userEmail = sessions[sessionId];

    // 檢查使用者是否在允許清單中
    if (!config.allowedEmails.canFind(userEmail)) {
        res.statusCode = 403;
        res.writeBody(
            "<html><body><h1>存取被拒</h1><p>您的帳號沒有權限存取此系統。</p></body></html>",
            "text/html; charset=UTF-8"
        );
        return;
    }
}

// 取得當前登入使用者
string getCurrentUser(HTTPServerRequest req) {
    auto sessionId = req.cookies.get("session_id", "");
    if (sessionId in sessions) {
        return sessions[sessionId];
    }
    return "";
}

// ============================================================================
// Google OAuth 2.0 處理
// ============================================================================

User exchangeCodeForToken(string code) {
    User user;

    try {
        auto tokenUrl = "https://oauth2.googleapis.com/token";

        requestHTTP(tokenUrl,
            (scope req) {
                req.method = HTTPMethod.POST;
                req.contentType = "application/x-www-form-urlencoded";

                auto postData = format(
                    "code=%s&client_id=%s&client_secret=%s&redirect_uri=%s&grant_type=authorization_code",
                    code, config.googleClientId, config.googleClientSecret, config.googleRedirectUri
                );

                req.writeBody(cast(ubyte[])postData);
            },
            (scope res) {
                auto response = res.readJson();
                user.accessToken = response["access_token"].get!string;

                // 取得使用者資訊
                requestHTTP("https://www.googleapis.com/oauth2/v2/userinfo",
                    (scope infoReq) {
                        infoReq.method = HTTPMethod.GET;
                        infoReq.headers["Authorization"] = "Bearer " ~ user.accessToken;
                    },
                    (scope infoRes) {
                        auto userInfo = infoRes.readJson();
                        user.email = userInfo["email"].get!string;
                        user.name = userInfo["name"].get!string;

                        logInfo("User logged in: %s (%s)", user.name, user.email);
                    }
                );
            }
        );
    } catch (Exception e) {
        logError("OAuth error: %s", e.msg);
    }

    return user;
}

// ============================================================================
// Google Sheets API 處理 - 使用 Python 輔助腳本
// ============================================================================

// 新增公告到 Google Sheets（透過 Python 腳本）
void appendToGoogleSheets(Json announcement) {
    if (config.googleSheetsId.empty) {
        logWarn("Google Sheets ID not configured. Skipping append.");
        return;
    }

    try {
        import std.process : execute;

        // 準備資料
        auto data = Json.emptyObject;
        data["title"] = announcement["title"];
        data["content"] = announcement["content"];
        data["categories"] = Json(announcement["categories"].get!(Json[]).map!(c => c.get!string).join(", "));
        data["date"] = announcement["date"];
        data["posterName"] = announcement["posterName"];
        data["readBy"] = Json(""); // 已閱讀名單（初始為空）
        data["scores"] = Json(""); // 測驗成績（初始為空）

        // 執行 Python 腳本
        auto pythonScript = "./scripts/append_to_sheets.py";
        auto result = execute([
            "python3",
            pythonScript,
            config.googleSheetsId,
            config.googleServiceAccountKeyPath,
            data.toString()
        ]);

        if (result.status == 0) {
            logInfo("Successfully appended to Google Sheets");
        } else {
            logError("Failed to append to Google Sheets: %s", result.output);
        }
    } catch (Exception e) {
        logError("Google Sheets append error: %s", e.msg);
    }
}

// ============================================================================
// ChatGPT API 處理
// ============================================================================

Json generateQuiz(string title, string content) {
    Json quizData = Json.emptyObject;

    if (config.openaiApiKey.empty) {
        logWarn("OpenAI API key not configured");
        return quizData;
    }

    try {
        auto apiUrl = "https://api.openai.com/v1/chat/completions";

        auto prompt = format(
            "根據以下公告內容，請生成 10 到 15 題的選擇題測驗，用來測試員工是否理解公告內容。\n\n" ~
            "標題：%s\n\n內容：%s\n\n" ~
            "請以 JSON 格式回傳，結構如下：\n" ~
            "{\"questions\": [{\"question\": \"問題內容\", \"options\": [\"選項A\", \"選項B\", \"選項C\", \"選項D\"], \"correctAnswer\": 0}]}\n" ~
            "其中 correctAnswer 是正確答案的索引（0-3）。請只回傳 JSON，不要有其他文字。",
            title, content
        );

        auto requestBody = Json.emptyObject;
        requestBody["model"] = "gpt-3.5-turbo";

        auto messages = Json.emptyArray;
        auto message = Json.emptyObject;
        message["role"] = "user";
        message["content"] = prompt;
        messages ~= message;

        requestBody["messages"] = messages;
        requestBody["temperature"] = 0.7;
        requestBody["max_tokens"] = 2000;

        requestHTTP(apiUrl,
            (scope req) {
                req.method = HTTPMethod.POST;
                req.headers["Authorization"] = "Bearer " ~ config.openaiApiKey;
                req.headers["Content-Type"] = "application/json";
                req.writeJsonBody(requestBody);
            },
            (scope res) {
                auto response = res.readJson();

                if ("choices" in response && response["choices"].length > 0) {
                    auto chatResponse = response["choices"][0]["message"]["content"].get!string;

                    // 移除可能的 markdown 標記
                    chatResponse = chatResponse.strip();
                    if (chatResponse.startsWith("```json")) {
                        chatResponse = chatResponse[7..$];
                    }
                    if (chatResponse.startsWith("```")) {
                        chatResponse = chatResponse[3..$];
                    }
                    if (chatResponse.endsWith("```")) {
                        chatResponse = chatResponse[0..$-3];
                    }
                    chatResponse = chatResponse.strip();

                    quizData = parseJsonString(chatResponse);
                    logInfo("Quiz generated successfully with %s questions", quizData["questions"].length);
                }
            }
        );
    } catch (Exception e) {
        logError("ChatGPT API error: %s", e.msg);
        quizData = Json.emptyObject;
    }

    return quizData;
}

// ============================================================================
// 路由處理函式
// ============================================================================

// 登入頁面
void handleLogin(HTTPServerRequest req, HTTPServerResponse res) {
    if (config.googleClientId.empty) {
        res.writeBody("<html><body><h1>系統設定錯誤</h1><p>請設定 GOOGLE_CLIENT_ID 環境變數</p></body></html>");
        return;
    }

    auto authUrl = format(
        "https://accounts.google.com/o/oauth2/v2/auth?client_id=%s&redirect_uri=%s&response_type=code&scope=openid%%20email%%20profile",
        config.googleClientId, config.googleRedirectUri
    );
    res.redirect(authUrl);
}

// OAuth 回呼處理
void handleAuthCallback(HTTPServerRequest req, HTTPServerResponse res) {
    auto code = req.query.get("code", "");

    if (code.empty) {
        res.redirect("/login");
        return;
    }

    auto user = exchangeCodeForToken(code);

    if (user.email.empty) {
        res.writeBody("<html><body><h1>認證失敗</h1><p>無法取得使用者資訊</p></body></html>");
        return;
    }

    // 檢查使用者是否有權限
    if (!config.allowedEmails.canFind(user.email)) {
        res.statusCode = 403;
        res.writeBody(
            format("<html><body><h1>存取被拒</h1><p>您的帳號 (%s) 沒有權限存取此系統。</p></body></html>", user.email),
            "text/html; charset=UTF-8"
        );
        return;
    }

    // 建立 Session
    auto sessionId = randomUUID().toString();
    sessions[sessionId] = user.email;

    auto cookie = new Cookie();
    cookie.value = sessionId;
    cookie.path = "/";
    cookie.maxAge = 86400; // 24 小時
    res.cookies["session_id"] = cookie;

    res.redirect("/");
}

// 登出
void handleLogout(HTTPServerRequest req, HTTPServerResponse res) {
    auto sessionId = req.cookies.get("session_id", "");
    if (sessionId in sessions) {
        sessions.remove(sessionId);
    }

    auto cookie = new Cookie();
    cookie.value = "";
    cookie.path = "/";
    cookie.maxAge = 0;
    res.cookies["session_id"] = cookie;

    res.redirect("/login");
}

// 首頁
void handleIndex(HTTPServerRequest req, HTTPServerResponse res) {
    requireAuth(req, res);
    if (res.headerWritten) return;

    auto userEmail = getCurrentUser(req);
    res.render!("index.dt", userEmail, announcements);
}

// 取得所有公告（API）
void handleGetAnnouncements(HTTPServerRequest req, HTTPServerResponse res) {
    requireAuth(req, res);
    if (res.headerWritten) return;

    auto category = req.query.get("category", "");
    auto search = req.query.get("search", "");

    auto filteredAnnouncements = announcements;

    // 分類篩選
    if (!category.empty) {
        auto filtered = Json.emptyArray;
        foreach (ann; filteredAnnouncements) {
            auto categories = ann["categories"].get!(Json[]);
            if (categories.map!(c => c.get!string).canFind(category)) {
                filtered ~= ann;
            }
        }
        filteredAnnouncements = filtered;
    }

    // 關鍵字搜尋
    if (!search.empty) {
        auto filtered = Json.emptyArray;
        auto searchLower = search.toLower();
        foreach (ann; filteredAnnouncements) {
            auto title = ann["title"].get!string.toLower();
            auto content = ann["content"].get!string.toLower();
            if (title.indexOf(searchLower) >= 0 || content.indexOf(searchLower) >= 0) {
                filtered ~= ann;
            }
        }
        filteredAnnouncements = filtered;
    }

    res.writeJsonBody(filteredAnnouncements);
}

// 建立新公告（API）
void handleCreateAnnouncement(HTTPServerRequest req, HTTPServerResponse res) {
    requireAuth(req, res);
    if (res.headerWritten) return;

    try {
        auto announcement = Json.emptyObject;
        announcement["id"] = Json(randomUUID().toString());
        announcement["posterName"] = req.json["posterName"];
        announcement["title"] = req.json["title"];
        announcement["content"] = req.json["content"];
        announcement["date"] = Json(Clock.currTime().toISOExtString());

        // 處理可選的 categories 欄位
        if ("categories" in req.json) {
            announcement["categories"] = req.json["categories"];
        } else {
            announcement["categories"] = Json.emptyArray;
        }

        announcement["readBy"] = Json.emptyArray;
        announcement["scores"] = Json.emptyObject;

        // 加入記憶體陣列
        announcements ~= announcement;

        // 寫入 Google Sheets
        appendToGoogleSheets(announcement);

        logInfo("New announcement created: %s", announcement["title"].get!string);

        res.writeJsonBody(Json(["success": Json(true), "id": announcement["id"]]));
    } catch (Exception e) {
        logError("Error creating announcement: %s", e.msg);
        res.statusCode = 400;
        res.writeJsonBody(Json(["success": Json(false), "error": Json(e.msg)]));
    }
}

// 標記公告為已讀（API）
void handleMarkAsRead(HTTPServerRequest req, HTTPServerResponse res) {
    requireAuth(req, res);
    if (res.headerWritten) return;

    auto userEmail = getCurrentUser(req);
    auto announcementId = req.params["id"];

    // 在記憶體中更新
    foreach (ref ann; announcements) {
        if (ann["id"].get!string == announcementId) {
            auto readBy = ann["readBy"].get!(Json[]);

            // 檢查是否已經簽到過
            bool alreadyRead = false;
            foreach (reader; readBy) {
                if (reader.get!string == userEmail) {
                    alreadyRead = true;
                    break;
                }
            }

            if (!alreadyRead) {
                readBy ~= Json(userEmail);
                ann["readBy"] = Json(readBy);
                logInfo("User %s marked announcement %s as read", userEmail, announcementId);
            }

            break;
        }
    }

    // TODO: 更新 Google Sheets

    res.writeJsonBody(Json(["success": Json(true)]));
}

// 生成測驗（API）
void handleGenerateQuiz(HTTPServerRequest req, HTTPServerResponse res) {
    requireAuth(req, res);
    if (res.headerWritten) return;

    try {
        auto title = req.json["title"].get!string;
        auto content = req.json["content"].get!string;

        auto quiz = generateQuiz(title, content);

        if (quiz.type == Json.Type.object && "questions" in quiz) {
            res.writeJsonBody(quiz);
        } else {
            res.statusCode = 500;
            res.writeJsonBody(Json(["success": Json(false), "error": Json("Failed to generate quiz")]));
        }
    } catch (Exception e) {
        logError("Error generating quiz: %s", e.msg);
        res.statusCode = 500;
        res.writeJsonBody(Json(["success": Json(false), "error": Json(e.msg)]));
    }
}

// 提交測驗成績（API）
void handleSubmitQuiz(HTTPServerRequest req, HTTPServerResponse res) {
    requireAuth(req, res);
    if (res.headerWritten) return;

    auto userEmail = getCurrentUser(req);
    auto announcementId = req.params["id"];
    auto score = req.json["score"].get!int;
    auto total = req.json["total"].get!int;

    // 取得使用者名稱和是否通過
    string userName = "";
    if ("userName" in req.json) {
        userName = req.json["userName"].get!string;
    }

    bool passed = false;
    if ("passed" in req.json) {
        passed = req.json["passed"].get!bool;
    }

    // 在記憶體中更新
    foreach (ref ann; announcements) {
        if (ann["id"].get!string == announcementId) {
            auto scores = ann["scores"];
            auto userScore = Json.emptyObject;
            userScore["score"] = Json(score);
            userScore["total"] = Json(total);
            userScore["percentage"] = Json(cast(int)((score * 100.0) / total));
            userScore["date"] = Json(Clock.currTime().toISOExtString());
            userScore["userName"] = Json(userName);
            userScore["passed"] = Json(passed);

            scores[userEmail] = userScore;
            ann["scores"] = scores;

            logInfo("User %s (%s) submitted quiz for announcement %s: %d/%d (passed: %s)",
                    userEmail, userName, announcementId, score, total, passed ? "yes" : "no");
            break;
        }
    }

    // TODO: 更新 Google Sheets

    res.writeJsonBody(Json(["success": Json(true), "score": Json(score), "total": Json(total)]));
}

// 刪除公告（API - 僅限管理員）
void handleDeleteAnnouncement(HTTPServerRequest req, HTTPServerResponse res) {
    requireAuth(req, res);
    if (res.headerWritten) return;

    auto userEmail = getCurrentUser(req);
    auto announcementId = req.params["id"];

    // 檢查是否為管理員
    if (userEmail != "bennettcheng1224@gmail.com") {
        res.statusCode = 403;
        res.writeJsonBody(Json(["success": Json(false), "error": Json("只有管理員可以刪除公告")]));
        return;
    }

    // 從記憶體中刪除
    auto filtered = Json.emptyArray;
    bool found = false;
    foreach (ann; announcements) {
        if (ann["id"].get!string != announcementId) {
            filtered ~= ann;
        } else {
            found = true;
            logInfo("Admin %s deleted announcement: %s", userEmail, ann["title"].get!string);
        }
    }

    if (!found) {
        res.statusCode = 404;
        res.writeJsonBody(Json(["success": Json(false), "error": Json("找不到該公告")]));
        return;
    }

    announcements = filtered;

    // TODO: 從 Google Sheets 刪除

    res.writeJsonBody(Json(["success": Json(true)]));
}

// 更新公告分類（API - 僅限管理員）
void handleUpdateCategories(HTTPServerRequest req, HTTPServerResponse res) {
    requireAuth(req, res);
    if (res.headerWritten) return;

    auto userEmail = getCurrentUser(req);
    auto announcementId = req.params["id"];

    // 檢查是否為管理員
    if (userEmail != "bennettcheng1224@gmail.com") {
        res.statusCode = 403;
        res.writeJsonBody(Json(["success": Json(false), "error": Json("只有管理員可以修改分類")]));
        return;
    }

    try {
        auto categories = req.json["categories"];

        // 在記憶體中更新
        bool found = false;
        foreach (ref ann; announcements) {
            if (ann["id"].get!string == announcementId) {
                ann["categories"] = categories;
                found = true;
                logInfo("Admin %s updated categories for announcement: %s", userEmail, ann["title"].get!string);
                break;
            }
        }

        if (!found) {
            res.statusCode = 404;
            res.writeJsonBody(Json(["success": Json(false), "error": Json("找不到該公告")]));
            return;
        }

        // TODO: 更新 Google Sheets

        res.writeJsonBody(Json(["success": Json(true)]));
    } catch (Exception e) {
        logError("Error updating categories: %s", e.msg);
        res.statusCode = 400;
        res.writeJsonBody(Json(["success": Json(false), "error": Json(e.msg)]));
    }
}

// ============================================================================
// 主程式入口
// ============================================================================

shared static this() {
    loadConfig();

    auto settings = new HTTPServerSettings;
    settings.port = config.serverPort;
    settings.bindAddresses = ["0.0.0.0"];
    settings.sessionStore = new MemorySessionStore;

    auto router = new URLRouter;

    // 認證路由
    router.get("/login", &handleLogin);
    router.get("/auth/callback", &handleAuthCallback);
    router.get("/logout", &handleLogout);

    // 主要路由
    router.get("/", &handleIndex);
    router.get("/api/announcements", &handleGetAnnouncements);
    router.post("/api/announcements", &handleCreateAnnouncement);
    router.delete_("/api/announcements/:id", &handleDeleteAnnouncement);
    router.put("/api/announcements/:id/categories", &handleUpdateCategories);
    router.post("/api/announcements/:id/read", &handleMarkAsRead);
    router.post("/api/quiz/generate", &handleGenerateQuiz);
    router.post("/api/announcements/:id/quiz", &handleSubmitQuiz);

    // 靜態檔案服務
    router.get("*", serveStaticFiles("public/"));

    listenHTTP(settings, router);

    logInfo("======================================================");
    logInfo("76DollShop 內部公告與學習系統");
    logInfo("伺服器運行於 http://localhost:%d", config.serverPort);
    logInfo("======================================================");
}
