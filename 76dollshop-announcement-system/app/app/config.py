from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # Google OAuth
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8080/auth/callback")

    # Google Sheets
    google_sheets_id: str = ""
    google_service_account_email: str = ""
    google_service_account_key_path: str = "./service-account-key.json"

    # OpenAI
    openai_api_key: str = ""

    # Access Control
    allowed_emails: str = ""

    # Server
    server_port: int = 8080
    session_secret: str = "change-me-in-production"

    # Database
    database_url: str = "sqlite:///./announcements.db"

    class Config:
        env_file = ".env"
        case_sensitive = False

    def get_allowed_emails(self) -> List[str]:
        """Parse allowed emails from comma-separated string"""
        if not self.allowed_emails:
            return []
        return [email.strip() for email in self.allowed_emails.split(",")]


settings = Settings()
