import json
import ast
import re
from typing import Any, Union

def json_fixer(broken: Union[str, dict, list]) -> Any:
    """
    Normalize a "broken" JSON-like payload into a valid JSON-compatible Python object.
    
    Accepts:
      - Python dict/list (possibly containing Python literals like None)
      - A JSON string
      - A Python-literal string (single quotes, None, True/False, trailing commas)
    
    Returns:
      - A Python object (dict/list) ready for json.dumps(...).
    
    Notes:
      - Uses ast.literal_eval to safely evaluate Python-literal strings (this is the
        most reliable approach for payloads that look like Python reprs).
      - If ast.literal_eval fails, a heuristic fallback attempts to convert the string
        (single->double quotes, None/True/False -> null/true/false, removal of trailing commas).
      - If conversion still fails, a JSONDecodeError / ValueError is raised.
    """
    # If it's already a Python object (dict/list), make sure it's JSON-serializable and return it
    if isinstance(broken, (dict, list)):
        # Convert to JSON string and back to ensure normalization of types
        return json.loads(json.dumps(broken, ensure_ascii=False))
    
    # If it's already valid JSON string, parse and return
    if isinstance(broken, str):
        s = broken.strip()
        # Try real JSON first
        try:
            return json.loads(s)
        except json.JSONDecodeError:
            pass
        
        # Try to treat as a Python literal (safest for Python-like payloads)
        try:
            python_obj = ast.literal_eval(s)
            # normalize via json round-trip to convert Python None/True/False -> JSON types
            return json.loads(json.dumps(python_obj, ensure_ascii=False))
        except Exception:
            pass
        
        # Fallback heuristic conversions (best-effort)
        # 1) Remove trailing commas before } or ]
        s_clean = re.sub(r',(\s*[}\]])', r'\1', s)
        # 2) Replace single quotes around keys/strings with double quotes (naive but works in many cases)
        #    We try to avoid touching already-correct double-quoted strings by only replacing single-quote pairs.
        s_clean = re.sub(r"(?<!\\)\'", '"', s_clean)
        # 3) Replace Python literals None/True/False with JSON equivalents
        s_clean = re.sub(r'\bNone\b', 'null', s_clean)
        s_clean = re.sub(r'\bTrue\b', 'true', s_clean)
        s_clean = re.sub(r'\bFalse\b', 'false', s_clean)
        
        # Final attempt to parse
        try:
            return json.loads(s_clean)
        except Exception as e:
            # Give a helpful error
            raise ValueError(
                "Unable to parse input as JSON or Python literal. "
                "ast.literal_eval failed and fallback heuristics did not produce valid JSON."
            ) from e
    
    # Not a str/dict/list — can't handle
    raise TypeError("Input must be a str, dict, or list.")

# ---------------------
# Example quick tests:
if __name__ == "__main__":
    # Python-style object with None and trailing commas
    py_obj = {"a": 1, "b": None, "c": [1,2,],}
    print(json_fixer(py_obj))   # -> {'a': 1, 'b': None, 'c': [1, 2]}

    # Python-literal string
    py_str = "{'a': 1, 'b': None, 'c': [1, 2,],}"
    print(json_fixer(py_str))

    # Valid JSON string (unchanged)
    json_str = '{"a": 1, "b": null, "c": [1, 2]}'
    print(json_fixer(json_str))
