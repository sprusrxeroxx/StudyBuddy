from flask import Blueprint, request, jsonify
from models import db, Exam, Question, SubQuestion, SubSection
import logging


exams_bp = Blueprint('exams', __name__)
logger = logging.getLogger(__name__)

@exams_bp.route('/', methods=['GET'])
def get_exams():
    """Get all exams"""
    try:
        exams = Exam.query.all()
        return jsonify([{
            'id': e.id,
            'year': e.year,
            'subject': e.subject,
            'province': e.province,
            'month': e.month,
            '_v': e._v,
            'question_count': len(e.questions)
        } for e in exams])
    except Exception as e:
        logger.error(f"Error fetching exams: {str(e)}")
        return jsonify({'error': 'Database error'}), 500

@exams_bp.route('/', methods=['POST'])
def create_exam():
    """Create a new exam"""
    try:
        data = request.json
        exam = Exam(
            year=data['exam']['year'],
            subject=data['exam']['subject'],
            province=data['exam'].get('province'),
            month=data['exam'].get('month'),
            _v=data['exam'].get('_v', 1)
        )
        db.session.add(exam)
        db.session.commit()
        return jsonify({'id': exam.id}), 201
    except KeyError as e:
        return jsonify({'error': f'Missing required field: {str(e)}'}), 400
    except Exception as e:
        logger.error(f"Error creating exam: {str(e)}")
        return jsonify({'error': 'Database error'}), 500

@exams_bp.route('/<int:exam_id>', methods=['GET'])
def get_exam(exam_id):
    """Get a specific exam by ID"""
    try:
        exam = Exam.query.get_or_404(exam_id)
        return jsonify({
            'id': exam.id,
            'year': exam.year,
            'subject': exam.subject,
            'province': exam.province,
            'month': exam.month,
            '_v': exam._v,
            'question_count': len(exam.questions)
        })
    except Exception as e:
        logger.error(f"Error fetching exam {exam_id}: {str(e)}")
        return jsonify({'error': 'Database error'}), 500

@exams_bp.route('/<int:exam_id>/full', methods=['GET'])
def get_full_exam(exam_id):
    """Get complete exam with all questions, subquestions, and subsections"""
    try:
        exam = Exam.query.get_or_404(exam_id)
        questions = []

        for q in sorted(exam.questions, key=lambda x: (x.sort_order or 0)):
            question_data = {
                'id': q.id,
                'stem': q.stem,
                'sort_order': q.sort_order,
                'sub_questions': []
            }

            for sq in sorted(q.sub_questions, key=lambda x: (x.sort_order or 0)):
                subq_data = {
                    'id': sq.id,
                    'stem': sq.stem,
                    'sort_order': sq.sort_order,
                    'sub_sections': []
                }

                for ss in sorted(sq.sub_sections, key=lambda x: (x.sort_order or 0)):
                    subsec_data = {
                        'id': ss.id,
                        'stem': ss.stem,
                        'sort_order': ss.sort_order
                    }
                    subq_data['sub_sections'].append(subsec_data)

                question_data['sub_questions'].append(subq_data)

            questions.append(question_data)

        return jsonify({
            'id': exam.id,
            'year': exam.year,
            'subject': exam.subject,
            'province': exam.province,
            'month': exam.month,
            'questions': questions
        })
    except Exception as e:
        logger.error(f"Error fetching full exam {exam_id}: {str(e)}")
        return jsonify({'error': 'Database error'}), 500

@exams_bp.route('/bulk', methods=['POST'])
def create_exam_bulk():
    """Create exam with all questions, subquestions, and subsections in one request"""
    try:
        data = request.json
        # Create exam - support both old and new format
        if 'exam' in data:
            exam_data = data['exam']
        else:
            exam_data = data
            
        exam = Exam(
            year=exam_data['year'],
            subject=exam_data['subject'],
            province=exam_data.get('province'),
            month=exam_data.get('month'),
            _v=exam_data.get('_v', 1)
        )
        db.session.add(exam)
        db.session.flush()  # Get exam ID without committing
        
        # Process questions hierarchy
        for q_data in data.get('questions', []):
            question = Question(
                exam_id=exam.id,
                stem=q_data['stem'],
                sort_order=q_data.get('sort_order', 1)
            )
            db.session.add(question)
            db.session.flush()
            
            # Process sub-questions
            for sq_data in q_data.get('sub_questions', []):
                sub_question = SubQuestion(
                    question_id=question.id,
                    stem=sq_data['stem'],
                    sort_order=sq_data.get('sort_order', 1)
                )
                db.session.add(sub_question)
                db.session.flush()
                
                # Process sub-sections
                for ss_data in sq_data.get('sub_sections', []):
                    sub_section = SubSection(
                        sub_question_id=sub_question.id,
                        stem=ss_data['stem'],
                        sort_order=ss_data.get('sort_order', 1)
                    )
                    db.session.add(sub_section)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Exam created successfully',
            'exam_id': exam.id
        }), 201
        
    except KeyError as e:
        db.session.rollback()
        return jsonify({'error': f'Missing required field: {str(e)}'}), 400
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating bulk exam: {str(e)}")
        return jsonify({'error': 'Database error'}), 500

@exams_bp.route('/<int:exam_id>', methods=['DELETE'])
def delete_exam(exam_id):
    """Delete an exam and all its questions/subquestions/subsections"""
    try:
        exam = Exam.query.get_or_404(exam_id)
        db.session.delete(exam)
        db.session.commit()
        
        return jsonify({'message': 'Exam deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting exam {exam_id}: {str(e)}")
        return jsonify({'error': 'Database error'}), 500