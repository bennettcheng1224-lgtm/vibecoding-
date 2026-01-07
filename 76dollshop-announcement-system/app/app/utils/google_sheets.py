from google.oauth2 import service_account
from googleapiclient.discovery import build
from app.config import settings
import os


class GoogleSheetsService:
    def __init__(self):
        self.sheets_id = settings.google_sheets_id
        self.service = None

        if self.sheets_id and os.path.exists(settings.google_service_account_key_path):
            try:
                credentials = service_account.Credentials.from_service_account_file(
                    settings.google_service_account_key_path,
                    scopes=['https://www.googleapis.com/auth/spreadsheets']
                )
                self.service = build('sheets', 'v4', credentials=credentials)
            except Exception as e:
                print(f"Failed to initialize Google Sheets service: {e}")

    def append_announcement(self, announcement_dict: dict):
        """Append announcement to Google Sheets"""
        if not self.service or not self.sheets_id:
            print("Google Sheets not configured, skipping append")
            return

        try:
            # Prepare row data
            categories_str = ", ".join(announcement_dict.get('categories', []))
            read_by_str = ", ".join(announcement_dict.get('readBy', []))

            # Convert scores dict to string
            scores = announcement_dict.get('scores', {})
            scores_str = ""
            if scores:
                scores_list = []
                for email, score_data in scores.items():
                    scores_list.append(
                        f"{email}: {score_data['score']}/{score_data['total']} "
                        f"({score_data['percentage']}%)"
                    )
                scores_str = "; ".join(scores_list)

            values = [[
                announcement_dict['title'],
                announcement_dict['content'],
                categories_str,
                announcement_dict['date'],
                announcement_dict['posterName'],
                read_by_str,
                scores_str
            ]]

            body = {'values': values}

            result = self.service.spreadsheets().values().append(
                spreadsheetId=self.sheets_id,
                range='A:G',
                valueInputOption='RAW',
                body=body
            ).execute()

            print(f"Successfully appended to Google Sheets: {result.get('updates')}")

        except Exception as e:
            print(f"Error appending to Google Sheets: {e}")

    def update_announcement(self, announcement_dict: dict, row_number: int = None):
        """Update existing announcement in Google Sheets (找到並更新該行)"""
        if not self.service or not self.sheets_id:
            print("Google Sheets not configured, skipping update")
            return

        try:
            # 如果沒有指定行號，先搜尋該公告
            if row_number is None:
                row_number = self._find_announcement_row(announcement_dict['id'])
                if row_number is None:
                    # 找不到就新增
                    print(f"Announcement not found in Sheets, appending instead")
                    self.append_announcement(announcement_dict)
                    return

            # Prepare updated data
            categories_str = ", ".join(announcement_dict.get('categories', []))
            read_by_str = ", ".join(announcement_dict.get('readBy', []))

            scores = announcement_dict.get('scores', {})
            scores_str = ""
            if scores:
                scores_list = []
                for email, score_data in scores.items():
                    scores_list.append(
                        f"{email}: {score_data['score']}/{score_data['total']} "
                        f"({score_data['percentage']}%) {'✅' if score_data.get('passed') else '❌'}"
                    )
                scores_str = "; ".join(scores_list)

            values = [[
                announcement_dict['title'],
                announcement_dict['content'],
                categories_str,
                announcement_dict['date'],
                announcement_dict['posterName'],
                read_by_str,
                scores_str
            ]]

            body = {'values': values}

            result = self.service.spreadsheets().values().update(
                spreadsheetId=self.sheets_id,
                range=f'A{row_number}:G{row_number}',
                valueInputOption='RAW',
                body=body
            ).execute()

            print(f"Successfully updated Google Sheets row {row_number}: {result.get('updatedCells')} cells")

        except Exception as e:
            print(f"Error updating Google Sheets: {e}")

    def _find_announcement_row(self, announcement_id: str):
        """在 Sheets 中搜尋公告 ID 對應的行號 (需要在 H 欄儲存 ID)"""
        if not self.service or not self.sheets_id:
            return None

        try:
            result = self.service.spreadsheets().values().get(
                spreadsheetId=self.sheets_id,
                range='H:H'  # 假設在 H 欄儲存 announcement ID
            ).execute()

            values = result.get('values', [])
            for i, row in enumerate(values, start=1):
                if row and row[0] == announcement_id:
                    return i

            return None

        except Exception as e:
            print(f"Error finding announcement in Sheets: {e}")
            return None

    def sync_announcement_data(self, announcement_dict: dict):
        """智能同步：如果存在則更新，不存在則新增"""
        if not self.service or not self.sheets_id:
            print("Google Sheets not configured, skipping sync")
            return

        try:
            # 檢查是否需要加入 ID 欄
            row_number = self._find_announcement_row(announcement_dict['id'])

            if row_number:
                # 更新現有資料（包含最新的閱讀與測驗記錄）
                self.update_announcement(announcement_dict, row_number)
            else:
                # 新增資料（並同時加入 ID 到 H 欄）
                self._append_with_id(announcement_dict)

        except Exception as e:
            print(f"Error syncing to Google Sheets: {e}")

    def _append_with_id(self, announcement_dict: dict):
        """新增公告時同時寫入 ID 到 H 欄"""
        try:
            categories_str = ", ".join(announcement_dict.get('categories', []))
            read_by_str = ", ".join(announcement_dict.get('readBy', []))

            scores = announcement_dict.get('scores', {})
            scores_str = ""
            if scores:
                scores_list = []
                for email, score_data in scores.items():
                    scores_list.append(
                        f"{email}: {score_data['score']}/{score_data['total']} "
                        f"({score_data['percentage']}%) {'✅' if score_data.get('passed') else '❌'}"
                    )
                scores_str = "; ".join(scores_list)

            values = [[
                announcement_dict['title'],
                announcement_dict['content'],
                categories_str,
                announcement_dict['date'],
                announcement_dict['posterName'],
                read_by_str,
                scores_str,
                announcement_dict['id']  # 加入 ID 到 H 欄
            ]]

            body = {'values': values}

            result = self.service.spreadsheets().values().append(
                spreadsheetId=self.sheets_id,
                range='A:H',  # 擴展到 H 欄
                valueInputOption='RAW',
                body=body
            ).execute()

            print(f"Successfully appended to Google Sheets with ID: {result.get('updates')}")

        except Exception as e:
            print(f"Error appending with ID to Google Sheets: {e}")


# Singleton instance
google_sheets_service = GoogleSheetsService()
