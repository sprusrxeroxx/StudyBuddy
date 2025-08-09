import re
import logging
from typing import Optional

logger = logging.getLogger(__name__)

def extract_questions_from_json(pdf_json):
    questions = []
    current_question = None
    
    for page in pdf_json.get('children', []):
        page_number = extract_page_number_from_id(page.get('id', ''))
        
        for block in page.get('children', []):
            block_type = block.get('block_type')
            html = block.get('html', '')
            
            # New question detection
            if block_type == 'SectionHeader' and 'QUESTION' in html:
                if current_question:
                    questions.append(current_question)
                
                try:
                    question_number = extract_question_number(html)
                    current_question = {
                        'page_number': page_number,
                        'question_number': question_number,
                        'stem': '',
                        'content_html': html,
                        'sub_questions': []
                    }
                except Exception as e:
                    logger.error(f"Error parsing question header: {html} - {str(e)}")
                    current_question = None
            
            # Add to question content
            elif current_question and block_type in ['Text', 'TextInlineMath']:
                try:
                    current_question['stem'] += ' ' + sanitize_text(html)
                    current_question['content_html'] += html
                except Exception as e:
                    logger.error(f"Error processing text block: {str(e)}")
            
            # Process sub-questions
            elif current_question and block_type == 'ListGroup':
                for item in block.get('children', []):
                    if item.get('block_type') == 'ListItem':
                        try:
                            item_html = item.get('html', '')
                            sq_content = sanitize_text(item_html)
                            current_question['sub_questions'].append({
                                'content': extract_subquestion_content(sq_content),
                                'marks': extract_marks(item_html),
                                'topics': []  # Will be stored as JSON
                            })
                        except Exception as e:
                            logger.error(f"Error parsing list item: {item_html} - {str(e)}")
    
    if current_question:
        questions.append(current_question)
    
    return questions

# Helper functions (same as before)
def sanitize_text(html: str) -> str:
    """
    Removes HTML tags and cleans up whitespace.
    """
    if not html:
        return ""
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', html)
    # Normalize whitespace (replace multiple spaces/newlines with a single space)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def extract_question_number(html_text: str) -> Optional[str]:
    """
    Extracts the question number (e.g., '6') from a header string like 'QUESTION 6'.
    """
    match = re.search(r'QUESTION\s*(\d+)', html_text, re.IGNORECASE)
    return match.group(1) if match else None

def extract_page_number_from_id(element_id: str) -> Optional[int]:
    """
    Extracts the page number from an element's ID string (e.g., '/page/5/...').
    """
    if not element_id:
        return None
    match = re.search(r'/page/(\d+)/', element_id)
    return int(match.group(1)) if match else None

def extract_marks(text: str) -> Optional[int]:
    """
    Extracts the mark value from a string, looking for a number in parentheses, e.g., (3).
    """
    # Searches for the last occurrence of a number in parentheses
    matches = re.findall(r'\((\d+)\)', text)
    return int(matches[-1]) if matches else None

def extract_subquestion_content(text: str) -> str:
    """
    Removes the mark allocation from the sub-question text to get the clean content.
    """
    # Removes all occurrences of (X) where X is a number
    return re.sub(r'\s*\(\d+\)\s*$', '', text).strip()