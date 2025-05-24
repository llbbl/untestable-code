"""
This example demonstrates the Constructor Side Effects anti-pattern:

1. Database connections in constructors
2. File system operations in constructors
3. Network calls in constructors
4. Global state modifications
5. Complex initialization logic
"""

import json
import os
import sqlite3
import smtplib
from datetime import datetime
from typing import Dict, List, Optional


class DatabaseConnection:
    """Database connection with side effects in constructor"""
    def __init__(self, db_path: str = 'app.db'):
        # Side effect: Creates/connects to database
        self.conn = sqlite3.connect(db_path)
        self.cursor = self.conn.cursor()
        
        # Side effect: Creates tables
        self._create_tables()
        
        # Side effect: Initializes global state
        self._initialize_global_state()

    def _create_tables(self):
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                username TEXT UNIQUE,
                email TEXT UNIQUE,
                created_at TIMESTAMP
            )
        ''')
        self.conn.commit()

    def _initialize_global_state(self):
        # Side effect: Modifies global state
        global DATABASE_INITIALIZED
        DATABASE_INITIALIZED = True


class EmailService:
    """Email service with side effects in constructor"""
    def __init__(self):
        # Side effect: Connects to SMTP server
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.sender_email = "app@example.com"
        self.sender_password = "password123"
        
        # Side effect: Establishes connection
        self._connect_to_smtp()
        
        # Side effect: Creates log directory
        self._setup_logging()

    def _connect_to_smtp(self):
        # Side effect: Network connection
        self.smtp = smtplib.SMTP(self.smtp_server, self.smtp_port)
        self.smtp.starttls()
        self.smtp.login(self.sender_email, self.sender_password)

    def _setup_logging(self):
        # Side effect: File system operation
        if not os.path.exists('logs'):
            os.makedirs('logs')


class UserManager:
    """User manager with side effects in constructor"""
    def __init__(self):
        # Side effect: Creates database connection
        self.db = DatabaseConnection()
        
        # Side effect: Creates email service
        self.email_service = EmailService()
        
        # Side effect: Loads configuration
        self._load_config()
        
        # Side effect: Registers with monitoring service
        self._register_with_monitoring()

    def _load_config(self):
        # Side effect: File system operation
        if not os.path.exists('config.json'):
            with open('config.json', 'w') as f:
                json.dump({
                    'max_users': 1000,
                    'email_notifications': True
                }, f)

    def _register_with_monitoring(self):
        # Side effect: Network call
        print("Registering with monitoring service...")


class UserService:
    """User service with side effects in constructor"""
    def __init__(self):
        # Side effect: Creates user manager
        self.user_manager = UserManager()
        
        # Side effect: Initializes cache
        self._initialize_cache()
        
        # Side effect: Starts background tasks
        self._start_background_tasks()

    def _initialize_cache(self):
        # Side effect: Creates cache directory
        if not os.path.exists('cache'):
            os.makedirs('cache')

    def _start_background_tasks(self):
        # Side effect: Starts background processing
        print("Starting background tasks...")


def main():
    # Example usage
    user_service = UserService()
    
    # The following operations are affected by constructor side effects:
    # - Database connection is established
    # - SMTP connection is created
    # - Log directory is created
    # - Configuration file is created
    # - Cache directory is created
    # - Background tasks are started
    # - Monitoring service is registered
    print("User service initialized with all side effects")


if __name__ == '__main__':
    main() 