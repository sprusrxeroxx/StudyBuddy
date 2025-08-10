import re

def clean_markdown_line(line):
    """
    Cleans markdown line by:
    - Removing table formatting characters
    - Trimming whitespace
    - Preserving math expressions
    - Removing section headers
    """
    # Remove table borders and separators
    if re.match(r'^[\|:\- ]+$', line.strip()):
        return None
        
    # Remove header formatting but keep text
    line = re.sub(r'^\#{1,3}\s*(\*{2})?', '', line)
    line = re.sub(r'(\*{2})?\s*$', '', line)
    
    # Remove table pipes while preserving content
    if '|' in line:
        # Extract content from table cells
        cells = [cell.strip() for cell in line.split('|') if cell.strip()]
        line = ' '.join(cells)
    
    # Remove horizontal rules
    line = re.sub(r'^\s*[\-\*]{3,}\s*$', '', line)
    
    # Remove page numbers and totals like [18]
    line = re.sub(r'\[\d+\]\s*$', '', line)
    
    #Remove marks
    _remove_all_paren_nums = re.compile(r'\(\d+\)')
    line = _remove_all_paren_nums.sub('', line)
    line = re.sub(r'\s{2,}', ' ', line).strip()

    return line.strip()