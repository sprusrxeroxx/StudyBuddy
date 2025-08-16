from flask import Flask, jsonify
from database import init_db, db
import models as models
from routes.exams import exams_bp
from routes.questions import questions_bp
from routes.subquestions import subquestions_bp
from routes.subsections import subsections_bp

app = Flask(__name__)

# Initialize database
init_db(app)

# Register blueprints
app.register_blueprint(exams_bp, url_prefix='/api/exams')
app.register_blueprint(questions_bp, url_prefix='/api/questions')
app.register_blueprint(subquestions_bp, url_prefix='/api/subquestions')
app.register_blueprint(subsections_bp, url_prefix='/api/subsections')

@app.route('/')
def health_check():
    try:
        # Simple database check
        exam_count = models.Exam.query.count()
        return jsonify({
            'status': 'healthy',
            'exams_in_database': exam_count
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.cli.command("init-db")
def init_db_command():
    """Create database tables"""
    db.create_all()
    print("Database tables created")

if __name__ == '__main__':
    app.run(debug=True)