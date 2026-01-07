from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Announcement, AllowedEmail
from app.auth import get_current_user, is_admin, sessions
from pydantic import BaseModel

router = APIRouter(prefix="/admin", tags=["admin"])
templates = Jinja2Templates(directory="app/templates")


def require_admin(current_user: str = Depends(get_current_user)):
    """Middleware to require admin access"""
    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


class AllowedEmailCreate(BaseModel):
    email: str
    employee_name: str = None  # 員工姓名(可選)


class AnnouncementUpdate(BaseModel):
    title: str
    content: str
    categories: List[str]


@router.get("/", response_class=HTMLResponse)
async def admin_dashboard(
    request: Request,
    db: Session = Depends(get_db)
):
    """Admin dashboard page"""
    # Check if user is logged in
    session_id = request.cookies.get("session_id")
    if not session_id or session_id not in sessions:
        return RedirectResponse(url="/login")

    current_user = sessions[session_id]

    # Check if user is admin
    if not is_admin(current_user):
        return HTMLResponse(
            "<html><body><h1>Access Denied</h1>"
            "<p>Only administrators can access this page.</p>"
            "<p><a href='/'>Return to Home</a></p>"
            "</body></html>",
            status_code=403
        )

    # Get all announcements
    announcements = db.query(Announcement).order_by(Announcement.created_at.desc()).all()

    # Get all allowed emails
    allowed_emails = db.query(AllowedEmail).order_by(AllowedEmail.created_at.desc()).all()

    return templates.TemplateResponse(
        "admin.html",
        {
            "request": request,
            "user_email": current_user,
            "announcements": [ann.to_dict() for ann in announcements],
            "allowed_emails": allowed_emails
        }
    )


@router.get("/api/allowed-emails")
async def get_allowed_emails(
    current_user: str = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all allowed emails"""
    emails = db.query(AllowedEmail).order_by(AllowedEmail.created_at.desc()).all()
    return {
        "emails": [
            {
                "id": email.id,
                "email": email.email,
                "employee_name": email.employee_name,
                "added_by": email.added_by,
                "created_at": email.created_at.isoformat()
            }
            for email in emails
        ]
    }


@router.post("/api/allowed-emails")
async def add_allowed_email(
    email_data: AllowedEmailCreate,
    current_user: str = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Add a new allowed email"""
    # Check if email already exists
    existing = db.query(AllowedEmail).filter(AllowedEmail.email == email_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    # Add new email
    new_email = AllowedEmail(
        email=email_data.email,
        employee_name=email_data.employee_name,
        added_by=current_user
    )
    db.add(new_email)
    db.commit()
    db.refresh(new_email)

    return {
        "success": True,
        "email": {
            "id": new_email.id,
            "email": new_email.email,
            "employee_name": new_email.employee_name,
            "added_by": new_email.added_by,
            "created_at": new_email.created_at.isoformat()
        }
    }


@router.delete("/api/allowed-emails/{email_id}")
async def delete_allowed_email(
    email_id: int,
    current_user: str = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete an allowed email"""
    email_record = db.query(AllowedEmail).filter(AllowedEmail.id == email_id).first()
    if not email_record:
        raise HTTPException(status_code=404, detail="Email not found")

    # Don't allow deleting admin's own email
    if email_record.email == current_user:
        raise HTTPException(status_code=400, detail="Cannot delete your own email")

    db.delete(email_record)
    db.commit()

    return {"success": True}


@router.get("/api/announcements/{announcement_id}")
async def get_announcement_detail(
    announcement_id: str,
    current_user: str = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get announcement details for editing"""
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")

    return announcement.to_dict()


@router.put("/api/announcements/{announcement_id}")
async def update_announcement(
    announcement_id: str,
    announcement_data: AnnouncementUpdate,
    current_user: str = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update an announcement"""
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")

    # Update basic fields
    announcement.title = announcement_data.title
    announcement.content = announcement_data.content

    # Update categories
    from app.models import Category
    announcement.categories.clear()
    for category_name in announcement_data.categories:
        category = db.query(Category).filter(Category.name == category_name).first()
        if not category:
            category = Category(name=category_name)
            db.add(category)
        announcement.categories.append(category)

    db.commit()
    db.refresh(announcement)

    return {"success": True, "announcement": announcement.to_dict()}


# Category Management APIs
@router.get("/api/categories")
async def get_categories(
    current_user: str = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all categories with usage count"""
    from app.models import Category
    from sqlalchemy import func

    categories = db.query(
        Category.id,
        Category.name,
        func.count(Announcement.id).label('usage_count')
    ).outerjoin(
        Category.announcements
    ).group_by(Category.id, Category.name).all()

    return {
        "categories": [
            {
                "id": cat.id,
                "name": cat.name,
                "usage_count": cat.usage_count
            }
            for cat in categories
        ]
    }


class CategoryCreate(BaseModel):
    name: str


@router.post("/api/categories")
async def create_category(
    category_data: CategoryCreate,
    current_user: str = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create a new category"""
    from app.models import Category

    # Check if category already exists
    existing = db.query(Category).filter(Category.name == category_data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")

    new_category = Category(name=category_data.name)
    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    return {
        "success": True,
        "category": {
            "id": new_category.id,
            "name": new_category.name
        }
    }


@router.delete("/api/categories/{category_id}")
async def delete_category(
    category_id: int,
    current_user: str = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete a category"""
    from app.models import Category

    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Check if category is in use
    if category.announcements:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete category '{category.name}' because it is used by {len(category.announcements)} announcement(s)"
        )

    db.delete(category)
    db.commit()

    return {"success": True}
