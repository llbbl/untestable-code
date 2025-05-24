"""
This example demonstrates how to test code with explicit side effects:

1. Uses mock objects for side effects
2. Tests business logic in isolation
3. Verifies side effect interactions
"""

import unittest
from unittest.mock import MagicMock, Mock
from datetime import datetime
from testable import (
    UserData, Storage, Logger, UserManager, UserValidator
)


class MockStorage(Storage):
    def __init__(self):
        self.data = {}
        self.save_calls = []
        self.load_calls = []
        self.delete_calls = []

    def save(self, key: str, data: dict) -> None:
        self.data[key] = data
        self.save_calls.append((key, data))

    def load(self, key: str) -> dict:
        self.load_calls.append(key)
        return self.data.get(key)

    def delete(self, key: str) -> bool:
        self.delete_calls.append(key)
        if key in self.data:
            del self.data[key]
            return True
        return False

    def exists(self, key: str) -> bool:
        return key in self.data


class MockLogger(Logger):
    def __init__(self):
        self.info_messages = []
        self.warning_messages = []

    def info(self, message: str) -> None:
        self.info_messages.append(message)

    def warning(self, message: str) -> None:
        self.warning_messages.append(message)


class TestUserManager(unittest.TestCase):
    def setUp(self):
        self.storage = MockStorage()
        self.logger = MockLogger()
        self.manager = UserManager(self.storage, self.logger)

    def test_create_user(self):
        # Create test data
        user_data = UserData(username="testuser", email="test@example.com")
        
        # Call the method
        result = self.manager.create_user(user_data)
        
        # Verify the result
        self.assertEqual(result.username, "testuser")
        self.assertEqual(result.email, "test@example.com")
        self.assertIsNotNone(result.created_at)
        
        # Verify side effects
        self.assertEqual(len(self.storage.save_calls), 1)
        saved_key, saved_data = self.storage.save_calls[0]
        self.assertEqual(saved_key, "testuser")
        self.assertEqual(saved_data["username"], "testuser")
        self.assertEqual(saved_data["email"], "test@example.com")
        
        # Verify logging
        self.assertEqual(len(self.logger.info_messages), 1)
        self.assertIn("Creating user: testuser", self.logger.info_messages)

    def test_get_user(self):
        # Setup test data
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "created_at": str(datetime.now())
        }
        self.storage.data["testuser"] = user_data
        
        # Call the method
        result = self.manager.get_user("testuser")
        
        # Verify the result
        self.assertIsNotNone(result)
        self.assertEqual(result.username, "testuser")
        self.assertEqual(result.email, "test@example.com")
        
        # Verify side effects
        self.assertEqual(len(self.storage.load_calls), 1)
        self.assertEqual(self.storage.load_calls[0], "testuser")
        
        # Verify logging
        self.assertEqual(len(self.logger.info_messages), 1)
        self.assertIn("Fetching user: testuser", self.logger.info_messages)

    def test_delete_user(self):
        # Setup test data
        self.storage.data["testuser"] = {"username": "testuser"}
        
        # Call the method
        result = self.manager.delete_user("testuser")
        
        # Verify the result
        self.assertTrue(result)
        self.assertNotIn("testuser", self.storage.data)
        
        # Verify side effects
        self.assertEqual(len(self.storage.delete_calls), 1)
        self.assertEqual(self.storage.delete_calls[0], "testuser")
        
        # Verify logging
        self.assertEqual(len(self.logger.info_messages), 1)
        self.assertIn("Deleting user: testuser", self.logger.info_messages)


class TestUserValidator(unittest.TestCase):
    def setUp(self):
        self.logger = MockLogger()
        self.validator = UserValidator(self.logger)

    def test_validate_valid_user(self):
        # Create test data
        user_data = UserData(username="testuser", email="test@example.com")
        
        # Call the method
        is_valid, errors = self.validator.validate_user(user_data)
        
        # Verify the result
        self.assertTrue(is_valid)
        self.assertEqual(len(errors), 0)
        
        # Verify logging
        self.assertEqual(len(self.logger.info_messages), 2)
        self.assertIn("Validating user: testuser", self.logger.info_messages)
        self.assertIn("Validation successful", self.logger.info_messages)

    def test_validate_invalid_user(self):
        # Create test data with missing email
        user_data = UserData(username="testuser", email="")
        
        # Call the method
        is_valid, errors = self.validator.validate_user(user_data)
        
        # Verify the result
        self.assertFalse(is_valid)
        self.assertEqual(len(errors), 1)
        self.assertIn("Email is required", errors)
        
        # Verify logging
        self.assertEqual(len(self.logger.info_messages), 1)
        self.assertEqual(len(self.logger.warning_messages), 1)
        self.assertIn("Validating user: testuser", self.logger.info_messages)
        self.assertIn("Validation failed", self.logger.warning_messages[0])


if __name__ == '__main__':
    unittest.main() 