from database import init_db, db
from flask import Flask
import click

app = Flask(__name__)
init_db(app)

with app.app_context():
    db.create_all()

@app.cli.command("init-db")
def init_db_command():
    """Create database tables"""
    db.create_all()
    print("Database tables created")

if __name__ == "__main__":
    app.run()