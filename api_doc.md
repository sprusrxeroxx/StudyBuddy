- **`backend/routes/exams.py`** - Exam endpoints only
- **`backend/routes/questions.py`** - Question endpoints only
- **`backend/routes/subquestions.py`** - SubQuestion endpoints only  
- **`backend/routes/subsections.py`** - SubSection endpoints only

#### Exam Endpoints (`/api/exams`)
- `GET /api/exams/` - Get all exams
- `POST /api/exams/` - Create a new exam  
- `GET /api/exams/{id}` - Get specific exam by ID
- `GET /api/exams/{id}/full` - Get complete exam with all questions
- `POST /api/exams/bulk` - Create exam with all questions in one request

#### Question Endpoints (`/api/questions`)
- `POST /api/questions/` - Create a new question (requires exam_id)
- `GET /api/questions/{id}` - Get specific question with all subquestions/subsections
- `PUT /api/questions/{id}` - Update a question
- `DELETE /api/questions/{id}` - Delete a question (cascades to subquestions/subsections)
- `GET /api/questions/by-exam/{exam_id}` - Get all questions for a specific exam

#### SubQuestion Endpoints (`/api/subquestions`)
- `POST /api/subquestions/` - Create a new subquestion (requires question_id)
- `GET /api/subquestions/{id}` - Get specific subquestion with all subsections
- `PUT /api/subquestions/{id}` - Update a subquestion
- `DELETE /api/subquestions/{id}` - Delete a subquestion (cascades to subsections)
- `GET /api/subquestions/by-question/{question_id}` - Get all subquestions for a specific question

#### SubSection Endpoints (`/api/subsections`)
- `POST /api/subsections/` - Create a new subsection (requires sub_question_id)
- `GET /api/subsections/{id}` - Get specific subsection
- `PUT /api/subsections/{id}` - Update a subsection
- `DELETE /api/subsections/{id}` - Delete a subsection
- `GET /api/subsections/by-subquestion/{subquestion_id}` - Get all subsections for a specific subquestion

### File Structure

```
backend/
├── routes/
│   ├── __init__.py
│   ├── exams.py          # Exam operations only
│   ├── questions.py      # Question operations only
│   ├── subquestions.py   # SubQuestion operations only
│   └── subsections.py    # SubSection operations only
├── app.py                # Updated with all blueprints
└── ...
```