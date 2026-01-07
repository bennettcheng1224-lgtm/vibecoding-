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


# Singleton instance
google_sheets_service = GoogleSheetsService()
