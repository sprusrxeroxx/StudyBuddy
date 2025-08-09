from flask_sqlalchemy import SQLAlchemy
from config import Config

db = SQLAlchemy()

def init_db(app):
    app.config.from_object(Config)
    db.init_app(app)
    
    # Create tables if they don't exist
    with app.app_context():
        db.create_all()