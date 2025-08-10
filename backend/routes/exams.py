from flask import Blueprint, request, jsonify
from utils import json_fixer
from parsers.pdf_parser import extract_questions_from_json
from models import db, Exam, Question, SubQuestion
import json
import logging


exams_bp = Blueprint('exams', __name__)
logger = logging.getLogger(__name__)

@exams_bp.route('/', methods=['GET'])
def get_exams():
    try:
        exams = Exam.query.all()
        return jsonify([{
            'id': e.id,
            'year': e.year,
            'subject': e.subject,
            'province': e.province,
            'question_count': len(e.questions)
        } for e in exams])
    except Exception as e:
        logger.error(f"Error fetching exams: {str(e)}")
        return jsonify({'error': 'Database error'}), 500

@exams_bp.route('/upload', methods=['POST'])
def upload_exam():
    data = request.json

    # validation/formating pipeline
    json_fixer(data.get('pdf_json'))

    exam_data = data.get('exam')
    pdf_json = data.get('pdf_json')
    
    if not exam_data or not pdf_json:
        return jsonify({'error': 'Missing exam data or PDF content'}), 400
    
    try:
        # Create new exam
        exam = Exam(
            year=exam_data['year'],
            subject=exam_data['subject'],
            province=exam_data.get('province')
        )
        db.session.add(exam)
        db.session.flush()  # Get exam ID
        
        # Parse questions
        questions = extract_questions_from_json(pdf_json)
        question_count = 0
        subquestion_count = 0
        
        for q_data in questions:
            question = Question(
                exam_id=exam.id,
                page_number=q_data['page_number'],
                question_number=q_data['question_number'],
                stem=q_data['stem'],
            )
            db.session.add(question)
            db.session.flush()
            
            for sq_data in q_data['sub_questions']:
                sub_question = SubQuestion(
                    question_id=question.id,
                    content=sq_data['content'],
                    marks=sq_data['marks'],
                    topics=json.dumps(sq_data['topics'])  # Store as JSON string
                )
                db.session.add(sub_question)
                subquestion_count += 1
            
            question_count += 1
        
        db.session.commit()
        
        return jsonify({
            'message': 'Exam uploaded successfully',
            'exam_id': exam.id,
            'questions': question_count,
            'sub_questions': subquestion_count
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.exception("Error uploading exam")
        return jsonify({'error': str(e)}), 500