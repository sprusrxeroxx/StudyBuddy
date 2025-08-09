import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev_key')
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:123456789@localhost/examdb'
    SQLALCHEMY_TRACK_MODIFICATIONS = False