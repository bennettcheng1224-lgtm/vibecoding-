from fastapi import HTTPException, Depends, Request
from fastapi.responses import RedirectResponse
from starlette.status import HTTP_403_FORBIDDEN
from authlib.integrations.starlette_client import OAuth
from app.config import settings
from app.database import SessionLocal
import httpx

# Configure OAuth
oauth = OAuth()
oauth.register(
    name='google',
    client_id=settings.google_client_id,
    client_secret=settings.google_client_secret,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)

# In-memory session store (for production, use Redis or database)
sessions = {}


def is_email_allowed(email: str) -> bool:
    """Check if email is allowed (from database or config)"""
    # Admin is always allowed
    if email == "bennettcheng1224@gmail.com":
        return True

    # Check database
    try:
        from app.models import AllowedEmail
        db = SessionLocal()
        exists = db.query(AllowedEmail).filter(AllowedEmail.email == email).first()
        db.close()
        if exists:
            return True
    except Exception as e:
        print(f"Error checking database for allowed email: {e}")

    # Fallback to config
    allowed_emails = settings.get_allowed_emails()
    return email in allowed_emails


def get_current_user(request: Request) -> str:
    """Get current user email from session"""
    session_id = request.cookies.get("session_id")
    if not session_id or session_id not in sessions:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user_email = sessions[session_id]

    # Check if user is allowed
    if not is_email_allowed(user_email):
        raise HTTPException(
            status_code=HTTP_403_FORBIDDEN,
            detail="Your account is not authorized to access this system"
        )

    return user_email


def is_admin(user_email: str) -> bool:
    """Check if user is admin"""
    return user_email == "bennettcheng1224@gmail.com"


def get_user_display_name(user_email: str) -> str:
    """Get user display name from allowed_emails table (employee_name) or fallback to email"""
    try:
        from app.models import AllowedEmail
        db = SessionLocal()
        allowed_email = db.query(AllowedEmail).filter(AllowedEmail.email == user_email).first()
        db.close()

        if allowed_email and allowed_email.employee_name:
            return allowed_email.employee_name
    except Exception as e:
        print(f"Error getting user display name: {e}")

    # Fallback to email
    return user_email


async def exchange_code_for_token(code: str) -> dict:
    """Exchange OAuth code for user information"""
    token_url = "https://oauth2.googleapis.com/token"

    data = {
        'code': code,
        'client_id': settings.google_client_id,
        'client_secret': settings.google_client_secret,
        'redirect_uri': settings.google_redirect_uri,
        'grant_type': 'authorization_code'
    }

    async with httpx.AsyncClient() as client:
        # Get access token
        token_response = await client.post(token_url, data=data)
        token_data = token_response.json()

        if 'access_token' not in token_data:
            raise HTTPException(status_code=400, detail="Failed to get access token")

        access_token = token_data['access_token']

        # Get user info
        user_info_response = await client.get(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            headers={'Authorization': f'Bearer {access_token}'}
        )
        user_info = user_info_response.json()

        return {
            'email': user_info.get('email'),
            'name': user_info.get('name'),
            'access_token': access_token
        }
