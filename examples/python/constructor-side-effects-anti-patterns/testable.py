"""
This example demonstrates how to avoid constructor side effects:

1. Separate construction from initialization
2. Use dependency injection
3. Make side effects explicit
4. Use factory methods
5. Allow for lazy initialization
"""

import json
import os
import sqlite3
import smtplib
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Dict, List, Optional


class DatabaseConnection:
    """Database connection without side effects in constructor"""
    def __init__(self, db_path: str = 'app.db'):
        self.db_path = db_path
        self.conn = None
        self.cursor = None

    def connect(self) -> None:
        """Explicit connection initialization"""
        self.conn = sqlite3.connect(self.db_path)
        self.cursor = self.conn.cursor()

    def create_tables(self) -> None:
        """Explicit table creation"""
        if not self.conn:
            raise RuntimeError("Database not connected")
            
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                username TEXT UNIQUE,
                email TEXT UNIQUE,
                created_at TIMESTAMP
            )
        ''')
        self.conn.commit()

    def close(self) -> None:
        """Explicit connection cleanup"""
        if self.conn:
            self.conn.close()
            self.conn = None
            self.cursor = None


class EmailService(ABC):
    """Abstract email service interface"""
    @abstractmethod
    def send_email(self, to: str, subject: str, body: str) -> None:
        pass


class SMTPEmailService(EmailService):
    """SMTP email service implementation"""
    def __init__(self, server: str, port: int, username: str, password: str):
        self.server = server
        self.port = port
        self.username = username
        self.password = password
        self.smtp = None

    def connect(self) -> None:
        """Explicit SMTP connection"""
        self.smtp = smtplib.SMTP(self.server, self.port)
        self.smtp.starttls()
        self.smtp.login(self.username, self.password)

    def send_email(self, to: str, subject: str, body: str) -> None:
        """Send email with explicit connection check"""
        if not self.smtp:
            raise RuntimeError("SMTP not connected")
            
        self.smtp.sendmail(
            self.username,
            to,
            f"Subject: {subject}\n\n{body}"
        )

    def close(self) -> None:
        """Explicit connection cleanup"""
        if self.smtp:
            self.smtp.quit()
            self.smtp = None


class ConfigManager:
    """Configuration manager without side effects"""
    def __init__(self, config_path: str = 'config.json'):
        self.config_path = config_path
        self.config = None

    def load_config(self) -> Dict:
        """Explicit configuration loading"""
        if not os.path.exists(self.config_path):
            self.config = {
                'max_users': 1000,
                'email_notifications': True
            }
            self.save_config()
        else:
            with open(self.config_path, 'r') as f:
                self.config = json.load(f)
        return self.config

    def save_config(self) -> None:
        """Explicit configuration saving"""
        with open(self.config_path, 'w') as f:
            json.dump(self.config, f)


class UserManager:
    """User manager without side effects"""
    def __init__(self, db: DatabaseConnection, email_service: EmailService, config_manager: ConfigManager):
        self.db = db
        self.email_service = email_service
        self.config_manager = config_manager

    def initialize(self) -> None:
        """Explicit initialization"""
        self.db.connect()
        self.db.create_tables()
        self.config_manager.load_config()
        if isinstance(self.email_service, SMTPEmailService):
            self.email_service.connect()

    def cleanup(self) -> None:
        """Explicit cleanup"""
        self.db.close()
        if isinstance(self.email_service, SMTPEmailService):
            self.email_service.close()


class UserService:
    """User service without side effects"""
    def __init__(self, user_manager: UserManager):
        self.user_manager = user_manager
        self.cache_dir = 'cache'

    def initialize(self) -> None:
        """Explicit initialization"""
        self.user_manager.initialize()
        if not os.path.exists(self.cache_dir):
            os.makedirs(self.cache_dir)

    def cleanup(self) -> None:
        """Explicit cleanup"""
        self.user_manager.cleanup()


def create_user_service(
    db_path: str = 'app.db',
    smtp_server: str = "smtp.gmail.com",
    smtp_port: int = 587,
    smtp_username: str = "app@example.com",
    smtp_password: str = "password123",
    config_path: str = 'config.json'
) -> UserService:
    """Factory function to create and initialize user service"""
    db = DatabaseConnection(db_path)
    email_service = SMTPEmailService(smtp_server, smtp_port, smtp_username, smtp_password)
    config_manager = ConfigManager(config_path)
    user_manager = UserManager(db, email_service, config_manager)
    user_service = UserService(user_manager)
    return user_service


def main():
    # Example usage with explicit initialization
    user_service = create_user_service()
    user_service.initialize()
    
    try:
        # Use the service...
        print("User service initialized without constructor side effects")
    finally:
        # Clean up resources
        user_service.cleanup()


if __name__ == '__main__':
    main() 