from datetime import datetime
from uuid import uuid4
from database import db
import json

class Exam(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    year = db.Column(db.Integer, nullable=False)
    subject = db.Column(db.String(100), nullable=False)
    province = db.Column(db.String(50))
    month = db.Column(db.String(30))
    _version = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    questions = db.relationship('Question', backref='exam', lazy=True, cascade='all, delete-orphan')

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey('exam.id'), nullable=False)
    question_number = db.Column(db.String(20), nullable=False)
    stem = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    sub_questions = db.relationship('SubQuestion', backref='question', lazy=True, cascade='all, delete-orphan')

class SubQuestion(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    solution = db.Column(db.Text)
    sub_question_number = db.Column(db.String(20), nullable=False)
    topics = db.Column(db.Text, default='[]')
    difficulty = db.Column(db.Float, default=0.5)
    attempts_correct = db.Column(db.Integer, default=0)
    attempts_total = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def get_topics(self):
        return json.loads(self.topics)
    
    def set_topics(self, topics):
        self.topics = json.dumps(topics)