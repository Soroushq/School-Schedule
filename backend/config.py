import os

class Config:
    """تنظیمات پایه"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-very-secret-key-here-change-in-production'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
class DevelopmentConfig(Config):
    """تنظیمات محیط توسعه"""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///school_schedule.db'

class ProductionConfig(Config):
    """تنظیمات محیط تولید"""
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///school_schedule.db'

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
} 