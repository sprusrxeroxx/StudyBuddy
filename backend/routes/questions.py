from flask import Blueprint, request, jsonify
from models import db, Exam, Question, SubQuestion, SubSection
import logging


questions_bp = Blueprint('questions', __name__)
logger = logging.getLogger(__name__)

@questions_bp.route('/', methods=['POST'])
def create_question():
    """Create a new question for an exam"""
    try:
        data = request.json
        exam_id = data.get('exam_id')
        
        if not exam_id:
            return jsonify({'error': 'exam_id is required'}), 400
            
        # Verify exam exists
        exam = Exam.query.get_or_404(exam_id)
        
        # Get next sort order
        last_question = Question.query.filter_by(exam_id=exam_id).order_by(Question.sort_order.desc()).first()
        next_order = last_question.sort_order + 1 if last_question else 1
        
        question = Question(
            exam_id=exam_id,
            stem=data.get('stem'),
            sort_order=data.get('sort_order', next_order)
        )
        db.session.add(question)
        db.session.commit()
        
        return jsonify({
            'id': question.id,
            'exam_id': question.exam_id,
            'stem': question.stem,
            'sort_order': question.sort_order,
            'question_number': f"Q{question.sort_order}"
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating question: {str(e)}")
        return jsonify({'error': 'Database error'}), 500

@questions_bp.route('/<int:question_id>', methods=['GET'])
def get_question(question_id):
    """Get a specific question by ID"""
    try:
        question = Question.query.get_or_404(question_id)
        
        # Get subquestions
        subquestions = []
        for sq in sorted(question.sub_questions, key=lambda x: (x.sort_order or 0)):
            subq_data = {
                'id': sq.id,
                'stem': sq.stem,
                'sort_order': sq.sort_order,
                'solutions': sq.solutions,
                'sub_sections': []
            }
            
            # Get subsections
            for ss in sorted(sq.sub_sections, key=lambda x: (x.sort_order or 0)):
                subsec_data = {
                    'id': ss.id,
                    'stem': ss.stem,
                    'solutions': ss.solutions,
                    'sort_order': ss.sort_order
                }
                subq_data['sub_sections'].append(subsec_data)
            
            subquestions.append(subq_data)
        
        return jsonify({
            'id': question.id,
            'exam_id': question.exam_id,
            'stem': question.stem,
            'sort_order': question.sort_order,
            'sub_questions': subquestions
        })
        
    except Exception as e:
        logger.error(f"Error fetching question {question_id}: {str(e)}")
        return jsonify({'error': 'Database error'}), 500

@questions_bp.route('/<int:question_id>', methods=['PUT'])
def update_question(question_id):
    """Update a question"""
    try:
        question = Question.query.get_or_404(question_id)
        data = request.json
        
        if 'stem' in data:
            question.stem = data['stem']
        if 'sort_order' in data:
            question.sort_order = data['sort_order']
            
        db.session.commit()
        
        return jsonify({
            'id': question.id,
            'exam_id': question.exam_id,
            'stem': question.stem,
            'sort_order': question.sort_order
        })
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating question {question_id}: {str(e)}")
        return jsonify({'error': 'Database error'}), 500

@questions_bp.route('/<int:question_id>', methods=['DELETE'])
def delete_question(question_id):
    """Delete a question and all its subquestions/subsections"""
    try:
        question = Question.query.get_or_404(question_id)
        db.session.delete(question)
        db.session.commit()
        
        return jsonify({'message': 'Question deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting question {question_id}: {str(e)}")
        return jsonify({'error': 'Database error'}), 500

@questions_bp.route('/by-exam/<int:exam_id>', methods=['GET'])
def get_questions_by_exam(exam_id):
    """Get all questions for a specific exam"""
    try:
        exam = Exam.query.get_or_404(exam_id)
        questions = []
        
        for q in sorted(exam.questions, key=lambda x: (x.sort_order or 0)):
            question_data = {
                'id': q.id,
                'stem': q.stem,
                'sort_order': q.sort_order,
                'solutions': q.solutions,
                'sub_questions_count': len(q.sub_questions)
            }
            questions.append(question_data)
        
        return jsonify({
            'exam_id': exam_id,
            'questions': questions
        })
        
    except Exception as e:
        logger.error(f"Error fetching questions for exam {exam_id}: {str(e)}")
        return jsonify({'error': 'Database error'}), 500
