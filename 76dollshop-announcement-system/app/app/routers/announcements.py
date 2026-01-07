from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Announcement, Category, ReadStatus, QuizScore, Comment
from app.auth import get_current_user, is_admin
from app.utils.google_sheets import google_sheets_service
from pydantic import BaseModel
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/announcements", tags=["announcements"])


class AnnouncementCreate(BaseModel):
    posterName: str
    title: str
    content: str
    categories: List[str] = []


class MarkAsReadRequest(BaseModel):
    pass


class QuizSubmit(BaseModel):
    score: int
    total: int
    userName: str
    passed: bool


class CommentCreate(BaseModel):
    content: str
    userName: str


@router.get("")
async def get_announcements(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Get all announcements with optional filtering"""
    query = db.query(Announcement)

    # Filter by category
    if category:
        query = query.join(Announcement.categories).filter(Category.name == category)

    # Filter by search term
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Announcement.title.ilike(search_term)) |
            (Announcement.content.ilike(search_term))
        )

    announcements = query.order_by(Announcement.created_at.desc()).all()
    return [ann.to_dict() for ann in announcements]


@router.post("")
async def create_announcement(
    announcement_data: AnnouncementCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Create a new announcement"""
    # Create announcement
    announcement = Announcement(
        id=str(uuid.uuid4()),
        title=announcement_data.title,
        content=announcement_data.content,
        poster_name=announcement_data.posterName,
        created_at=datetime.utcnow()
    )

    # Handle categories
    for category_name in announcement_data.categories:
        category = db.query(Category).filter(Category.name == category_name).first()
        if not category:
            category = Category(name=category_name)
            db.add(category)
        announcement.categories.append(category)

    db.add(announcement)
    db.commit()
    db.refresh(announcement)

    # Sync to Google Sheets
    try:
        google_sheets_service.append_announcement(announcement.to_dict())
    except Exception as e:
        print(f"Failed to sync to Google Sheets: {e}")

    return {"success": True, "id": announcement.id}


@router.delete("/{announcement_id}")
async def delete_announcement(
    announcement_id: str,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Delete an announcement (admin only)"""
    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Only admin can delete announcements")

    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")

    db.delete(announcement)
    db.commit()

    return {"success": True}


@router.put("/{announcement_id}/categories")
async def update_categories(
    announcement_id: str,
    categories: dict,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Update announcement categories (admin only)"""
    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Only admin can update categories")

    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")

    # Clear existing categories
    announcement.categories.clear()

    # Add new categories
    for category_name in categories.get("categories", []):
        category = db.query(Category).filter(Category.name == category_name).first()
        if not category:
            category = Category(name=category_name)
            db.add(category)
        announcement.categories.append(category)

    db.commit()

    return {"success": True}


@router.post("/{announcement_id}/read")
async def mark_as_read(
    announcement_id: str,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Mark announcement as read"""
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")

    # Check if already read
    existing = db.query(ReadStatus).filter(
        ReadStatus.announcement_id == announcement_id,
        ReadStatus.user_email == current_user
    ).first()

    if not existing:
        read_status = ReadStatus(
            announcement_id=announcement_id,
            user_email=current_user
        )
        db.add(read_status)
        db.commit()

    return {"success": True}


@router.post("/{announcement_id}/quiz")
async def submit_quiz(
    announcement_id: str,
    quiz_data: QuizSubmit,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Submit quiz score"""
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")

    # Update or create quiz score
    existing_score = db.query(QuizScore).filter(
        QuizScore.announcement_id == announcement_id,
        QuizScore.user_email == current_user
    ).first()

    percentage = round((quiz_data.score / quiz_data.total) * 100)

    if existing_score:
        existing_score.score = quiz_data.score
        existing_score.total = quiz_data.total
        existing_score.percentage = percentage
        existing_score.user_name = quiz_data.userName
        existing_score.passed = quiz_data.passed
        existing_score.created_at = datetime.utcnow()
    else:
        quiz_score = QuizScore(
            announcement_id=announcement_id,
            user_email=current_user,
            user_name=quiz_data.userName,
            score=quiz_data.score,
            total=quiz_data.total,
            percentage=percentage,
            passed=quiz_data.passed
        )
        db.add(quiz_score)

    db.commit()

    return {"success": True, "score": quiz_data.score, "total": quiz_data.total}


@router.post("/{announcement_id}/comments")
async def add_comment(
    announcement_id: str,
    comment_data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Add a comment to an announcement"""
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")

    comment = Comment(
        announcement_id=announcement_id,
        user_email=current_user,
        user_name=comment_data.userName,
        content=comment_data.content
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return {
        "success": True,
        "comment": {
            "id": comment.id,
            "userEmail": comment.user_email,
            "userName": comment.user_name,
            "content": comment.content,
            "date": comment.created_at.isoformat()
        }
    }


@router.delete("/comments/{comment_id}")
async def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Delete a comment (only own comments or admin)"""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    # Check if user owns the comment or is admin
    if comment.user_email != current_user and not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")

    db.delete(comment)
    db.commit()

    return {"success": True}
