from datetime import datetime
from uuid import uuid4
from .database import db

class Exam(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    year = db.Column(db.Integer, nullable=False)
    subject = db.Column(db.String(100), nullable=False)
    province = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    questions = db.relationship('Question', backref='exam', lazy=True)

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey('exam.id'), nullable=False)
    page_number = db.Column(db.Integer, nullable=False)
    question_number = db.Column(db.String(20), nullable=False)
    stem = db.Column(db.Text, nullable=False)
    content_html = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    sub_questions = db.relationship('SubQuestion', backref='question', lazy=True)

class SubQuestion(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    solution = db.Column(db.Text)  # Simplified for initial version
    topics = db.Column(db.JSON)  # Store as array of strings
    difficulty = db.Column(db.Float, default=0.5)  # Default medium difficulty
    attempts_correct = db.Column(db.Integer, default=0)
    attempts_total = db.Column(db.Integer, default=0)
    marks = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Curriculum topics model (for future expansion)
class CurriculumTopic(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)