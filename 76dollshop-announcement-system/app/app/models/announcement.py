from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Table, Boolean, Float
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()

# Association table for many-to-many relationship between announcements and categories
announcement_categories = Table(
    'announcement_categories',
    Base.metadata,
    Column('announcement_id', String, ForeignKey('announcements.id', ondelete='CASCADE')),
    Column('category_id', Integer, ForeignKey('categories.id', ondelete='CASCADE'))
)


class Announcement(Base):
    __tablename__ = 'announcements'

    id = Column(String, primary_key=True)
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    poster_name = Column(String(200), nullable=False)
    target_teams = Column(Text, nullable=True)  # 以逗號分隔的團隊列表，例如: "業務團隊,行銷團隊"
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    categories = relationship(
        'Category',
        secondary=announcement_categories,
        back_populates='announcements'
    )
    read_statuses = relationship(
        'ReadStatus',
        back_populates='announcement',
        cascade='all, delete-orphan'
    )
    quiz_scores = relationship(
        'QuizScore',
        back_populates='announcement',
        cascade='all, delete-orphan'
    )
    comments = relationship(
        'Comment',
        back_populates='announcement',
        cascade='all, delete-orphan'
    )

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'posterName': self.poster_name,
            'date': self.created_at.isoformat(),
            'categories': [cat.name for cat in self.categories],
            'targetTeams': self.target_teams.split(',') if self.target_teams else [],
            'readBy': [rs.user_name or rs.user_email for rs in self.read_statuses],
            'scores': {
                score.user_name or score.user_email: {
                    'score': score.score,
                    'total': score.total,
                    'percentage': score.percentage,
                    'date': score.created_at.isoformat(),
                    'userName': score.user_name,
                    'passed': score.passed
                }
                for score in self.quiz_scores
            },
            'comments': [
                {
                    'id': comment.id,
                    'userEmail': comment.user_email,
                    'userName': comment.user_name,
                    'content': comment.content,
                    'date': comment.created_at.isoformat()
                }
                for comment in self.comments
            ]
        }


class Category(Base):
    __tablename__ = 'categories'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)

    # Relationships
    announcements = relationship(
        'Announcement',
        secondary=announcement_categories,
        back_populates='categories'
    )


class ReadStatus(Base):
    __tablename__ = 'read_statuses'

    id = Column(Integer, primary_key=True, autoincrement=True)
    announcement_id = Column(String, ForeignKey('announcements.id', ondelete='CASCADE'), nullable=False)
    user_email = Column(String(255), nullable=False)
    user_name = Column(String(200), nullable=True)  # 員工姓名
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    announcement = relationship('Announcement', back_populates='read_statuses')


class QuizScore(Base):
    __tablename__ = 'quiz_scores'

    id = Column(Integer, primary_key=True, autoincrement=True)
    announcement_id = Column(String, ForeignKey('announcements.id', ondelete='CASCADE'), nullable=False)
    user_email = Column(String(255), nullable=False)
    user_name = Column(String(200), nullable=False)
    score = Column(Integer, nullable=False)
    total = Column(Integer, nullable=False)
    percentage = Column(Float, nullable=False)
    passed = Column(Boolean, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    announcement = relationship('Announcement', back_populates='quiz_scores')


class Comment(Base):
    __tablename__ = 'comments'

    id = Column(Integer, primary_key=True, autoincrement=True)
    announcement_id = Column(String, ForeignKey('announcements.id', ondelete='CASCADE'), nullable=False)
    user_email = Column(String(255), nullable=False)
    user_name = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    announcement = relationship('Announcement', back_populates='comments')


class AllowedEmail(Base):
    __tablename__ = 'allowed_emails'

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False)
    employee_name = Column(String(200), nullable=True)  # 員工姓名備註
    team = Column(String(100), nullable=True)  # 團隊：業務團隊、行銷團隊、所有團隊等
    added_by = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
