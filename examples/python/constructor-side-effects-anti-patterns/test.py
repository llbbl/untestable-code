"""
This example demonstrates how to test code without constructor side effects:

1. Test components in isolation
2. Mock dependencies
3. Test initialization separately
4. Test cleanup
5. Test error conditions
"""

import os
import unittest
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime

from testable import (
    DatabaseConnection,
    EmailService,
    SMTPEmailService,
    ConfigManager,
    UserManager,
    UserService,
    create_user_service
)


class TestDatabaseConnection(unittest.TestCase):
    def setUp(self):
        self.db = DatabaseConnection(':memory:')

    def test_connect_and_create_tables(self):
        # Test connection
        self.db.connect()
        self.assertIsNotNone(self.db.conn)
        self.assertIsNotNone(self.db.cursor)

        # Test table creation
        self.db.create_tables()
        self.db.cursor.execute('SELECT name FROM sqlite_master WHERE type="table"')
        tables = self.db.cursor.fetchall()
        self.assertIn(('users',), tables)

    def test_close(self):
        self.db.connect()
        self.db.close()
        self.assertIsNone(self.db.conn)
        self.assertIsNone(self.db.cursor)

    def test_create_tables_without_connection(self):
        with self.assertRaises(RuntimeError):
            self.db.create_tables()


class TestSMTPEmailService(unittest.TestCase):
    def setUp(self):
        self.email_service = SMTPEmailService(
            server="smtp.test.com",
            port=587,
            username="test@test.com",
            password="password"
        )

    @patch('smtplib.SMTP')
    def test_connect(self, mock_smtp):
        mock_smtp_instance = MagicMock()
        mock_smtp.return_value = mock_smtp_instance

        self.email_service.connect()
        mock_smtp.assert_called_once_with("smtp.test.com", 587)
        mock_smtp_instance.starttls.assert_called_once()
        mock_smtp_instance.login.assert_called_once_with("test@test.com", "password")

    @patch('smtplib.SMTP')
    def test_send_email(self, mock_smtp):
        mock_smtp_instance = MagicMock()
        mock_smtp.return_value = mock_smtp_instance
        self.email_service.smtp = mock_smtp_instance

        self.email_service.send_email("to@test.com", "Subject", "Body")
        mock_smtp_instance.sendmail.assert_called_once()

    def test_send_email_without_connection(self):
        with self.assertRaises(RuntimeError):
            self.email_service.send_email("to@test.com", "Subject", "Body")

    @patch('smtplib.SMTP')
    def test_close(self, mock_smtp):
        mock_smtp_instance = MagicMock()
        mock_smtp.return_value = mock_smtp_instance
        self.email_service.smtp = mock_smtp_instance

        self.email_service.close()
        mock_smtp_instance.quit.assert_called_once()
        self.assertIsNone(self.email_service.smtp)


class TestConfigManager(unittest.TestCase):
    def setUp(self):
        self.config_path = 'test_config.json'
        self.config_manager = ConfigManager(self.config_path)

    def tearDown(self):
        if os.path.exists(self.config_path):
            os.remove(self.config_path)

    def test_load_config_new_file(self):
        config = self.config_manager.load_config()
        self.assertEqual(config['max_users'], 1000)
        self.assertTrue(config['email_notifications'])
        self.assertTrue(os.path.exists(self.config_path))

    def test_load_config_existing_file(self):
        # Create existing config
        with open(self.config_path, 'w') as f:
            f.write('{"max_users": 500, "email_notifications": false}')

        config = self.config_manager.load_config()
        self.assertEqual(config['max_users'], 500)
        self.assertFalse(config['email_notifications'])

    def test_save_config(self):
        self.config_manager.config = {'test': 'value'}
        self.config_manager.save_config()
        
        with open(self.config_path, 'r') as f:
            saved_config = json.load(f)
        self.assertEqual(saved_config, {'test': 'value'})


class TestUserManager(unittest.TestCase):
    def setUp(self):
        self.db = Mock(spec=DatabaseConnection)
        self.email_service = Mock(spec=EmailService)
        self.config_manager = Mock(spec=ConfigManager)
        self.user_manager = UserManager(self.db, self.email_service, self.config_manager)

    def test_initialize(self):
        self.user_manager.initialize()
        self.db.connect.assert_called_once()
        self.db.create_tables.assert_called_once()
        self.config_manager.load_config.assert_called_once()

    def test_initialize_with_smtp(self):
        smtp_service = Mock(spec=SMTPEmailService)
        user_manager = UserManager(self.db, smtp_service, self.config_manager)
        user_manager.initialize()
        smtp_service.connect.assert_called_once()

    def test_cleanup(self):
        self.user_manager.cleanup()
        self.db.close.assert_called_once()

    def test_cleanup_with_smtp(self):
        smtp_service = Mock(spec=SMTPEmailService)
        user_manager = UserManager(self.db, smtp_service, self.config_manager)
        user_manager.cleanup()
        smtp_service.close.assert_called_once()


class TestUserService(unittest.TestCase):
    def setUp(self):
        self.user_manager = Mock(spec=UserManager)
        self.user_service = UserService(self.user_manager)
        self.cache_dir = 'cache'

    def tearDown(self):
        if os.path.exists(self.cache_dir):
            os.rmdir(self.cache_dir)

    def test_initialize(self):
        self.user_service.initialize()
        self.user_manager.initialize.assert_called_once()
        self.assertTrue(os.path.exists(self.cache_dir))

    def test_cleanup(self):
        self.user_service.cleanup()
        self.user_manager.cleanup.assert_called_once()


class TestUserServiceIntegration(unittest.TestCase):
    def setUp(self):
        self.db_path = ':memory:'
        self.config_path = 'test_config.json'
        self.user_service = create_user_service(
            db_path=self.db_path,
            config_path=self.config_path
        )

    def tearDown(self):
        if os.path.exists(self.config_path):
            os.remove(self.config_path)
        if os.path.exists('cache'):
            os.rmdir('cache')

    def test_create_user_service(self):
        self.assertIsInstance(self.user_service, UserService)
        self.assertIsInstance(self.user_service.user_manager, UserManager)
        self.assertIsInstance(self.user_service.user_manager.db, DatabaseConnection)
        self.assertIsInstance(self.user_service.user_manager.email_service, SMTPEmailService)
        self.assertIsInstance(self.user_service.user_manager.config_manager, ConfigManager)

    def test_initialize_and_cleanup(self):
        self.user_service.initialize()
        self.assertTrue(os.path.exists('cache'))
        self.assertTrue(os.path.exists(self.config_path))
        
        self.user_service.cleanup()
        # Verify cleanup by checking that we can create a new service
        new_service = create_user_service(
            db_path=self.db_path,
            config_path=self.config_path
        )
        new_service.initialize()
        new_service.cleanup()


if __name__ == '__main__':
    unittest.main() 