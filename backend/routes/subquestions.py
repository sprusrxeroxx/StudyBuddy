from flask import Blueprint, request, jsonify
from models import db, Question, SubQuestion, SubSection
import logging


subquestions_bp = Blueprint('subquestions', __name__)
logger = logging.getLogger(__name__)

@subquestions_bp.route('/', methods=['POST'])
def create_subquestion():
    """Create a new subquestion for a question"""
    try:
        data = request.json
        question_id = data.get('question_id')
        
        if not question_id:
            return jsonify({'error': 'question_id is required'}), 400
            
        # Verify question exists
        question = Question.query.get_or_404(question_id)
        
        # Get next sort order
        last_subq = SubQuestion.query.filter_by(question_id=question_id).order_by(SubQuestion.sort_order.desc()).first()
        next_order = last_subq.sort_order + 1 if last_subq else 1
        
        subquestion = SubQuestion(
            question_id=question_id,
            stem=data.get('stem'),
            sort_order=data.get('sort_order', next_order)
        )
        db.session.add(subquestion)
        db.session.commit()
        
        return jsonify({
            'id': subquestion.id,
            'question_id': subquestion.question_id,
            'stem': subquestion.stem,
            'sort_order': subquestion.sort_order,
            'subquestion_number': f"Q{question.sort_order}.{subquestion.sort_order}"
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating subquestion: {str(e)}")
        return jsonify({'error': 'Database error'}), 500

@subquestions_bp.route('/<int:subquestion_id>', methods=['GET'])
def get_subquestion(subquestion_id):
    """Get a specific subquestion by ID"""
    try:
        subquestion = SubQuestion.query.get_or_404(subquestion_id)
        
        # Get subsections
        subsections = []
        for ss in sorted(subquestion.sub_sections, key=lambda x: (x.sort_order or 0)):
            subsec_data = {
                'id': ss.id,
                'stem': ss.stem,
                'sort_order': ss.sort_order
            }
            subsections.append(subsec_data)
        
        return jsonify({
            'id': subquestion.id,
            'question_id': subquestion.question_id,
            'stem': subquestion.stem,
            'sort_order': subquestion.sort_order,
            'sub_sections': subsections
        })
        
    except Exception as e:
        logger.error(f"Error fetching subquestion {subquestion_id}: {str(e)}")
        return jsonify({'error': 'Database error'}), 500

@subquestions_bp.route('/<int:subquestion_id>', methods=['PUT'])
def update_subquestion(subquestion_id):
    """Update a subquestion"""
    try:
        subquestion = SubQuestion.query.get_or_404(subquestion_id)
        data = request.json
        
        if 'stem' in data:
            subquestion.stem = data['stem']
        if 'sort_order' in data:
            subquestion.sort_order = data['sort_order']
            
        db.session.commit()
        
        return jsonify({
            'id': subquestion.id,
            'question_id': subquestion.question_id,
            'stem': subquestion.stem,
            'sort_order': subquestion.sort_order
        })
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating subquestion {subquestion_id}: {str(e)}")
        return jsonify({'error': 'Database error'}), 500

@subquestions_bp.route('/<int:subquestion_id>', methods=['DELETE'])
def delete_subquestion(subquestion_id):
    """Delete a subquestion and all its subsections"""
    try:
        subquestion = SubQuestion.query.get_or_404(subquestion_id)
        db.session.delete(subquestion)
        db.session.commit()
        
        return jsonify({'message': 'Subquestion deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting subquestion {subquestion_id}: {str(e)}")
        return jsonify({'error': 'Database error'}), 500

@subquestions_bp.route('/by-question/<int:question_id>', methods=['GET'])
def get_subquestions_by_question(question_id):
    """Get all subquestions for a specific question"""
    try:
        question = Question.query.get_or_404(question_id)
        subquestions = []

        for sq in sorted(question.sub_questions, key=lambda x: (x.sort_order or 0)):
            subq_data = {
                'id': sq.id,
                'stem': sq.stem,
                'sort_order': sq.sort_order,
                'sub_sections_count': len(sq.sub_sections)
            }
            subquestions.append(subq_data)
        
        return jsonify({
            'question_id': question_id,
            'subquestions': subquestions
        })
        
    except Exception as e:
        logger.error(f"Error fetching subquestions for question {question_id}: {str(e)}")
        return jsonify({'error': 'Database error'}), 500
