from fastapi import FastAPI, Request, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, RedirectResponse
from app.database import init_db, get_db
from app.routers import auth, announcements, quiz, admin
from app.auth import get_current_user, sessions, is_admin
from app.config import settings
from sqlalchemy.orm import Session
import os

# Initialize FastAPI app
app = FastAPI(
    title="76DollShop Announcement System",
    description="Internal announcement and learning management system",
    version="2.0.0"
)

# Mount static files
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Setup templates
templates = Jinja2Templates(directory="app/templates")

# Include routers
app.include_router(auth.router)
app.include_router(announcements.router)
app.include_router(quiz.router)
app.include_router(admin.router)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    print("Initializing database...")
    init_db()
    print("Database initialized successfully!")
    print("=" * 60)
    print("76DollShop 內部公告與學習系統")
    print(f"Server running at http://localhost:{settings.server_port}")
    print("=" * 60)


@app.get("/")
async def index(request: Request):
    """Home page - redirect to login if not authenticated"""
    session_id = request.cookies.get("session_id")

    # Check if user is logged in
    if not session_id or session_id not in sessions:
        return RedirectResponse(url="/login")

    user_email = sessions[session_id]

    # Render page for authenticated users
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "user_email": user_email,
            "is_admin": is_admin(user_email)
        }
    )


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": "2.0.0"}
