from flask import Blueprint, request, jsonify
from parsers.markdown_parser import parse_markdown
from models import db, Exam, Question, SubQuestion
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
    exam_data = data.get('exam')
    pages = data.get('pages')  # Now expects list of {page_number, markdown}
    
    if not exam_data or not pages:
        return jsonify({'error': 'Missing exam data or pages content'}), 400
    
    try:
        # Create exam
        exam = Exam(
            year=exam_data['year'],
            subject=exam_data['subject'],
            province=exam_data['province'],
            month=exam_data['month'],
            _version=exam_data.get('_version', 1)
        )
        db.session.add(exam)
        db.session.flush()
        
        # Process each page
        for page in pages:
            markdown_content = page['markdown']
            
            # Parse markdown for this page
            questions = parse_markdown(markdown_content)
            
            for q_data in questions:
                question = Question(
                    exam_id=exam.id,
                    question_number=q_data['question_number'],
                    stem=q_data['stem']
                )
                db.session.add(question)
                db.session.flush()
                
                for sq_data in q_data['sub_questions']:
                    sub_question = SubQuestion(
                        question_id=question.id,
                        sub_question_number=sq_data['sub_question_number'],
                        content=sq_data['content'],
                        marks=sq_data['marks']
                    )
                    db.session.add(sub_question)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Exam uploaded successfully',
            'exam_id': exam.id,
            'pages_processed': len(pages)
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logging.exception("Error uploading exam")
        return jsonify({'error': str(e)}), 500