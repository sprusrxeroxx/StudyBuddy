import re

from utils import clean_markdown_line

def parse_markdown(markdown_content):
    """
    Parses markdown content into structured questions and sub-questions
    using state tracking and pattern matching
    """
    lines = markdown_content.split('\n')
    questions = []
    current_question = None
    current_subq = None
    in_math_block = False
    math_block_lines = []

    for line in lines:
        cleaned = clean_markdown_line(line)
        if not cleaned:
            continue

        # Handle multi-line math blocks
        if cleaned.startswith('$$'):
            if not in_math_block:
                # Start new math block
                in_math_block = True
                math_block_lines = [cleaned[2:].strip()]
            else:
                # End math block
                in_math_block = False
                math_block_lines.append(cleaned[:-2].strip())
                math_content = '\n'.join(math_block_lines)
                
                if current_subq:
                    current_subq['content'] += f" $${math_content}$$"
                elif current_question:
                    current_question['stem'] += f" $${math_content}$$"
            continue
            
        if in_math_block:
            math_block_lines.append(cleaned)
            continue

        # Detect question starters (number followed by text)
        question_match = re.match(r'^(\d+\.\d+)(\s+(.*))?$', cleaned)
        if question_match:
            # Finalize previous question if exists
            if current_question:
                if current_subq:
                    questions.append(current_question)
                    current_subq = None
                else:
                    # Handle questions without sub-questions
                    current_question['sub_questions'] = [{
                        'sub_question_number': current_question['question_number'] + '.1',
                        'content': current_question['stem']
                    }]
                    questions.append(current_question)
            
            # Start new question
            current_question = {
                'question_number': question_match.group(1),
                'stem': question_match.group(3) if question_match.group(3) else '',
                'sub_questions': []
            }
            current_subq = None
            continue

        # Detect sub-question starters
        subq_match = re.match(r'^(\d+\.\d+\.\d+)(\s+(.*))?$', cleaned)
        if subq_match:
            if current_question:
                # Finalize previous sub-question
                if current_subq:
                    current_question['sub_questions'].append(current_subq)
                
                # Start new sub-question
                current_subq = {
                    'sub_question_number': subq_match.group(1),
                    'content': subq_match.group(3) if subq_match.group(3) else ''
                }
            continue

        # Content accumulation
        if current_subq:
            # Add to current sub-question content
            current_subq['content'] += ' ' + cleaned
        elif current_question:
            # Add to question stem
            current_question['stem'] += ' ' + cleaned

    # Finalize last elements
    if current_subq and current_question:
        current_question['sub_questions'].append(current_subq)
    if current_question:
        questions.append(current_question)
    
    return questions