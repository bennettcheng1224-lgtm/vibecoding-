from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse, HTMLResponse
from app.auth import exchange_code_for_token, sessions, is_email_allowed
from app.config import settings
import uuid

router = APIRouter(tags=["auth"])


@router.get("/login")
async def login():
    """Redirect to Google OAuth login"""
    if not settings.google_client_id:
        return HTMLResponse(
            "<html><body><h1>System Configuration Error</h1>"
            "<p>Please set GOOGLE_CLIENT_ID environment variable</p></body></html>"
        )

    auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={settings.google_client_id}&"
        f"redirect_uri={settings.google_redirect_uri}&"
        f"response_type=code&"
        f"scope=openid%20email%20profile"
    )

    return RedirectResponse(url=auth_url)


@router.get("/auth/callback")
async def auth_callback(code: str = None):
    """Handle OAuth callback"""
    if not code:
        return RedirectResponse(url="/login")

    try:
        user_info = await exchange_code_for_token(code)

        if not user_info.get('email'):
            return HTMLResponse(
                "<html><body><h1>Authentication Failed</h1>"
                "<p>Unable to retrieve user information</p></body></html>"
            )

        user_email = user_info['email']

        # Check if user is allowed
        if not is_email_allowed(user_email):
            return HTMLResponse(
                f"<html><body><h1>Access Denied</h1>"
                f"<p>Your account ({user_email}) is not authorized to access this system.</p>"
                f"<p>Please contact the administrator to request access.</p>"
                f"</body></html>",
                status_code=403
            )

        # Create session
        session_id = str(uuid.uuid4())
        sessions[session_id] = user_email

        # Redirect to home with session cookie
        response = RedirectResponse(url="/")
        response.set_cookie(
            key="session_id",
            value=session_id,
            max_age=86400,  # 24 hours
            path="/"
        )

        return response

    except Exception as e:
        return HTMLResponse(
            f"<html><body><h1>Authentication Error</h1>"
            f"<p>{str(e)}</p></body></html>",
            status_code=500
        )


@router.get("/logout")
async def logout(request: Request):
    """Logout user"""
    session_id = request.cookies.get("session_id")
    if session_id and session_id in sessions:
        del sessions[session_id]

    response = RedirectResponse(url="/login")
    response.delete_cookie("session_id")

    return response
