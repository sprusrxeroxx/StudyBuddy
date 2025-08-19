from flask import Blueprint, request, jsonify
from models import db, SubQuestion, SubSection
import logging


subsections_bp = Blueprint('subsections', __name__)
logger = logging.getLogger(__name__)

@subsections_bp.route('/', methods=['POST'])
def create_subsection():
    """Create a new subsection for a subquestion"""
    try:
        data = request.json
        subquestion_id = data.get('sub_question_id')
        
        if not subquestion_id:
            return jsonify({'error': 'sub_question_id is required'}), 400
            
        if not data.get('stem'):
            return jsonify({'error': 'stem is required'}), 400
        
        # Verify subquestion exists
        subquestion = SubQuestion.query.get_or_404(subquestion_id)
        
        # Get next sort order
        last_subsec = SubSection.query.filter_by(sub_question_id=subquestion_id).order_by(SubSection.sort_order.desc()).first()
        next_order = last_subsec.sort_order + 1 if last_subsec else 1
        
        subsection = SubSection(
            sub_question_id=subquestion_id,
            stem=data['stem'],
            sort_order=data.get('sort_order', next_order),
            solutions=data['solutions']
        )
        db.session.add(subsection)
        db.session.commit()
        
        return jsonify({
            'id': subsection.id,
            'sub_question_id': subsection.sub_question_id,
            'stem': subsection.stem,
            'sort_order': subsection.sort_order,
            'solutions': subsection.solutions,
            'subsection_number': (
                f"Q{subquestion.question.sort_order}."
                f"{subquestion.sort_order}."
                f"{subsection.sort_order}"
            )
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating subsection: {str(e)}")
        return jsonify({'error': 'Database error'}), 500

@subsections_bp.route('/<int:subsection_id>', methods=['GET'])
def get_subsection(subsection_id):
    """Get a specific subsection by ID"""
    try:
        subsection = SubSection.query.get_or_404(subsection_id)
        
        return jsonify({
            'id': subsection.id,
            'sub_question_id': subsection.sub_question_id,
            'stem': subsection.stem,
            'sort_order': subsection.sort_order,
            'solutions': subsection.solutions
        })
        
    except Exception as e:
        logger.error(f"Error fetching subsection {subsection_id}: {str(e)}")
        return jsonify({'error': 'Database error'}), 500

@subsections_bp.route('/<int:subsection_id>', methods=['PUT'])
def update_subsection(subsection_id):
    """Update a subsection"""
    try:
        subsection = SubSection.query.get_or_404(subsection_id)
        data = request.json
        
        if 'stem' in data:
            subsection.stem = data['stem']
        if 'sort_order' in data:
            subsection.sort_order = data['sort_order']
        if 'solutions' in data:
            subsection.solutions = data['solutions']

        db.session.commit()
        
        return jsonify({
            'id': subsection.id,
            'sub_question_id': subsection.sub_question_id,
            'stem': subsection.stem,
            'sort_order': subsection.sort_order,
            'solutions': subsection.solutions
        })
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating subsection {subsection_id}: {str(e)}")
        return jsonify({'error': 'Database error'}), 500

@subsections_bp.route('/<int:subsection_id>', methods=['DELETE'])
def delete_subsection(subsection_id):
    """Delete a subsection"""
    try:
        subsection = SubSection.query.get_or_404(subsection_id)
        db.session.delete(subsection)
        db.session.commit()
        
        return jsonify({'message': 'Subsection deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting subsection {subsection_id}: {str(e)}")
        return jsonify({'error': 'Database error'}), 500

@subsections_bp.route('/by-subquestion/<int:subquestion_id>', methods=['GET'])
def get_subsections_by_subquestion(subquestion_id):
    """Get all subsections for a specific subquestion"""
    try:
        subquestion = SubQuestion.query.get_or_404(subquestion_id)
        subsections = []

        for ss in sorted(subquestion.sub_sections, key=lambda x: (x.sort_order or 0)):
            subsec_data = {
                'id': ss.id,
                'stem': ss.stem,
                'sort_order': ss.sort_order,
                'solutions': ss.solutions
            }
            subsections.append(subsec_data)
        
        return jsonify({
            'sub_question_id': subquestion_id,
            'subsections': subsections
        })
        
    except Exception as e:
        logger.error(f"Error fetching subsections for subquestion {subquestion_id}: {str(e)}")
        return jsonify({'error': 'Database error'}), 500
