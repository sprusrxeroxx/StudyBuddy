from database import db

class Exam(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    year = db.Column(db.Integer, nullable=False)
    subject = db.Column(db.String(100), nullable=False)
    province = db.Column(db.String(50))
    month = db.Column(db.String(30))
    _v = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.now())
    questions = db.relationship(
        'Question',
        backref='exam',
        lazy=True,
        cascade='all, delete-orphan',
        passive_deletes=True
    )

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey('exam.id', ondelete='CASCADE'), nullable=False)
    stem = db.Column(db.Text)
    sort_order = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=db.func.now())
    sub_questions = db.relationship(
        'SubQuestion',
        backref='question',
        lazy=True,
        cascade='all, delete-orphan',
        passive_deletes=True
    )

class SubQuestion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id', ondelete='CASCADE'), nullable=False)
    stem = db.Column(db.Text)
    sort_order = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=db.func.now())
    solutions = db.Column(db.Text)
    sub_sections = db.relationship(
        'SubSection',
        backref='sub_question',
        lazy=True,
        cascade='all, delete-orphan',
        passive_deletes=True
    )

class SubSection(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sub_question_id = db.Column(db.Integer, db.ForeignKey('sub_question.id', ondelete='CASCADE'), nullable=False)
    stem = db.Column(db.Text, nullable=False)
    sort_order = db.Column(db.Integer, default=1)
    solutions = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.now())
