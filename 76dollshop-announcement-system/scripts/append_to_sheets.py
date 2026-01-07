#!/usr/bin/env python3
"""
Google Sheets 寫入輔助腳本
從 D 程式接收 JSON 資料，寫入 Google Sheets
"""

import sys
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Google Sheets API 範圍
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

def append_to_sheet(spreadsheet_id, service_account_file, data):
    """
    將資料附加到 Google Sheets

    Args:
        spreadsheet_id: 試算表 ID
        service_account_file: 服務帳戶金鑰檔案路徑
        data: 要寫入的資料 (dict)
    """
    try:
        # 建立憑證
        credentials = service_account.Credentials.from_service_account_file(
            service_account_file, scopes=SCOPES)

        # 建立 Sheets API 服務
        service = build('sheets', 'v4', credentials=credentials)

        # 準備資料行
        values = [[
            data.get('title', ''),
            data.get('content', ''),
            data.get('categories', ''),
            data.get('date', ''),
            data.get('posterName', ''),
            data.get('readBy', ''),
            data.get('scores', '')
        ]]

        # 寫入資料
        body = {'values': values}

        result = service.spreadsheets().values().append(
            spreadsheetId=spreadsheet_id,
            range='A:G',
            valueInputOption='RAW',
            insertDataOption='INSERT_ROWS',
            body=body
        ).execute()

        print(json.dumps({
            'success': True,
            'updates': result.get('updates', {})
        }))
        return 0

    except HttpError as error:
        print(json.dumps({
            'success': False,
            'error': str(error)
        }), file=sys.stderr)
        return 1
    except Exception as error:
        print(json.dumps({
            'success': False,
            'error': str(error)
        }), file=sys.stderr)
        return 1

def main():
    """主函式"""
    if len(sys.argv) < 4:
        print(json.dumps({
            'success': False,
            'error': 'Usage: python3 append_to_sheets.py <spreadsheet_id> <service_account_file> <json_data>'
        }), file=sys.stderr)
        return 1

    spreadsheet_id = sys.argv[1]
    service_account_file = sys.argv[2]
    json_data_str = sys.argv[3]

    try:
        data = json.loads(json_data_str)
    except json.JSONDecodeError as e:
        print(json.dumps({
            'success': False,
            'error': f'Invalid JSON: {str(e)}'
        }), file=sys.stderr)
        return 1

    return append_to_sheet(spreadsheet_id, service_account_file, data)

if __name__ == '__main__':
    sys.exit(main())
