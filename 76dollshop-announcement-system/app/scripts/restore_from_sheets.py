#!/usr/bin/env python3
"""
從 Google Sheets 恢復公告資料到資料庫
"""

import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from google.oauth2 import service_account
from googleapiclient.discovery import build
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

from app.database import get_db, engine
from app.models import Announcement, Category

# Google Sheets API 範圍
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']

def read_from_sheets(spreadsheet_id: str, service_account_file: str):
    """從 Google Sheets 讀取所有公告資料"""
    try:
        # 建立憑證
        credentials = service_account.Credentials.from_service_account_file(
            service_account_file, scopes=SCOPES)

        # 建立 Sheets API 服務
        service = build('sheets', 'v4', credentials=credentials)

        # 讀取資料 (假設資料在 A:G 欄位)
        result = service.spreadsheets().values().get(
            spreadsheetId=spreadsheet_id,
            range='A2:G'  # 從第 2 行開始 (跳過標題)
        ).execute()

        values = result.get('values', [])

        if not values:
            print('❌ Google Sheets 中沒有找到資料')
            return []

        announcements = []
        for row in values:
            if len(row) < 5:  # 至少需要標題、內容、分類、日期、發布者
                continue

            announcement = {
                'title': row[0] if len(row) > 0 else '',
                'content': row[1] if len(row) > 1 else '',
                'categories': row[2].split(',') if len(row) > 2 and row[2] else [],
                'date': row[3] if len(row) > 3 else '',
                'posterName': row[4] if len(row) > 4 else '',
                'readBy': row[5].split(',') if len(row) > 5 and row[5] else [],
                'scores': row[6] if len(row) > 6 else ''
            }

            if announcement['title'] and announcement['content']:
                announcements.append(announcement)

        return announcements

    except Exception as error:
        print(f'❌ 讀取 Google Sheets 失敗: {error}')
        return []


def restore_announcements(announcements: list, db: Session):
    """將公告恢復到資料庫"""
    restored_count = 0

    for ann_data in announcements:
        try:
            # 檢查是否已存在 (根據標題和日期)
            existing = db.query(Announcement).filter(
                Announcement.title == ann_data['title'],
                Announcement.poster_name == ann_data['posterName']
            ).first()

            if existing:
                print(f'⏭️  跳過重複公告: {ann_data["title"]}')
                continue

            # 建立新公告
            announcement = Announcement(
                id=str(uuid.uuid4()),
                title=ann_data['title'],
                content=ann_data['content'],
                poster_name=ann_data['posterName'],
                created_at=datetime.fromisoformat(ann_data['date'].replace('Z', '+00:00')) if ann_data['date'] else datetime.utcnow()
            )

            # 加入分類
            for cat_name in ann_data['categories']:
                cat_name = cat_name.strip()
                if not cat_name:
                    continue

                category = db.query(Category).filter(Category.name == cat_name).first()
                if not category:
                    category = Category(name=cat_name)
                    db.add(category)
                announcement.categories.append(category)

            db.add(announcement)
            db.commit()

            print(f'✅ 已恢復公告: {ann_data["title"]}')
            restored_count += 1

        except Exception as e:
            print(f'❌ 恢復公告失敗 ({ann_data.get("title", "未知")}): {e}')
            db.rollback()
            continue

    return restored_count


def main():
    """主函式"""
    # 從環境變數讀取設定
    spreadsheet_id = os.getenv('GOOGLE_SHEETS_ID', '1dJqxNYt_pvFMfAHUljMoysToMJMz1myuVRoLRP9Wr9M')
    service_account_file = os.getenv('GOOGLE_SERVICE_ACCOUNT_KEY_PATH', '../service-account-key.json')

    # 轉換為絕對路徑
    service_account_file = os.path.abspath(os.path.join(os.path.dirname(__file__), service_account_file))

    print('🔄 開始從 Google Sheets 恢復資料...')
    print(f'📊 Spreadsheet ID: {spreadsheet_id}')
    print(f'🔑 Service Account Key: {service_account_file}')

    if not os.path.exists(service_account_file):
        print(f'❌ 找不到 Service Account 金鑰檔案: {service_account_file}')
        return 1

    # 讀取 Google Sheets 資料
    print('\n📖 正在讀取 Google Sheets...')
    announcements = read_from_sheets(spreadsheet_id, service_account_file)

    if not announcements:
        print('❌ 沒有找到可恢復的資料')
        return 1

    print(f'\n✅ 找到 {len(announcements)} 筆公告資料')

    # 恢復到資料庫
    print('\n💾 正在恢復到資料庫...')
    db = next(get_db())
    try:
        restored_count = restore_announcements(announcements, db)
        print(f'\n🎉 成功恢復 {restored_count} 筆公告！')
        return 0
    finally:
        db.close()


if __name__ == '__main__':
    sys.exit(main())
