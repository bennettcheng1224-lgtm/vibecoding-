"""
資料庫遷移腳本
添加新欄位：
1. announcements.target_teams
2. read_statuses.user_name
3. allowed_emails.team
"""

import sqlite3
import sys
from pathlib import Path

# 資料庫路徑
DB_PATH = Path(__file__).parent.parent / "announcements.db"

def migrate_database():
    """執行資料庫遷移"""
    print(f"正在遷移資料庫: {DB_PATH}")

    if not DB_PATH.exists():
        print("❌ 資料庫檔案不存在！")
        return False

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # 1. 為 announcements 表新增 target_teams 欄位
        print("1. 正在為 announcements 表新增 target_teams 欄位...")
        try:
            cursor.execute("ALTER TABLE announcements ADD COLUMN target_teams TEXT")
            print("   ✅ target_teams 欄位已新增")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("   ⚠️  target_teams 欄位已存在，跳過")
            else:
                raise

        # 2. 為 read_statuses 表新增 user_name 欄位
        print("2. 正在為 read_statuses 表新增 user_name 欄位...")
        try:
            cursor.execute("ALTER TABLE read_statuses ADD COLUMN user_name VARCHAR(200)")
            print("   ✅ user_name 欄位已新增")

            # 從 allowed_emails 表填充 user_name
            print("   正在從 allowed_emails 表填充 user_name...")
            cursor.execute("""
                UPDATE read_statuses
                SET user_name = (
                    SELECT employee_name
                    FROM allowed_emails
                    WHERE allowed_emails.email = read_statuses.user_email
                )
                WHERE user_name IS NULL
            """)
            affected = cursor.rowcount
            print(f"   ✅ 已更新 {affected} 筆記錄的 user_name")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("   ⚠️  user_name 欄位已存在，跳過")
            else:
                raise

        # 3. 為 allowed_emails 表新增 team 欄位
        print("3. 正在為 allowed_emails 表新增 team 欄位...")
        try:
            cursor.execute("ALTER TABLE allowed_emails ADD COLUMN team VARCHAR(100)")
            print("   ✅ team 欄位已新增")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("   ⚠️  team 欄位已存在，跳過")
            else:
                raise

        # 提交變更
        conn.commit()
        print("\n✅ 資料庫遷移完成！")
        return True

    except Exception as e:
        print(f"\n❌ 遷移失敗: {e}")
        conn.rollback()
        return False

    finally:
        conn.close()

if __name__ == "__main__":
    success = migrate_database()
    sys.exit(0 if success else 1)
