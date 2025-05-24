"""
This example demonstrates how to test the testable UserService:

1. Uses a mock session to simulate HTTP responses
2. Tests both get_user and create_user methods
3. Covers edge cases and error handling
"""

import unittest
from unittest.mock import MagicMock, patch
from testable import UserService

class TestUserService(unittest.TestCase):
    def setUp(self):
        self.mock_session = MagicMock()
        self.user_service = UserService(session=self.mock_session)

    def test_get_user_success(self):
        # Setup mock response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"id": 1, "name": "Test User"}
        self.mock_session.get.return_value = mock_response

        # Call the method
        result = self.user_service.get_user(1)

        # Verify the result
        self.assertEqual(result, {"id": 1, "name": "Test User"})
        self.mock_session.get.assert_called_once_with("https://api.example.com/users/1")

    def test_get_user_not_found(self):
        # Setup mock response
        mock_response = MagicMock()
        mock_response.status_code = 404
        self.mock_session.get.return_value = mock_response

        # Call the method
        result = self.user_service.get_user(999)

        # Verify the result
        self.assertIsNone(result)
        self.mock_session.get.assert_called_once_with("https://api.example.com/users/999")

    def test_create_user_success(self):
        # Setup mock response
        mock_response = MagicMock()
        mock_response.status_code = 201
        mock_response.json.return_value = {"id": 2, "name": "New User"}
        self.mock_session.post.return_value = mock_response

        # Call the method
        user_data = {"name": "New User"}
        result = self.user_service.create_user(user_data)

        # Verify the result
        self.assertEqual(result, {"id": 2, "name": "New User"})
        self.mock_session.post.assert_called_once_with("https://api.example.com/users", json=user_data)

    def test_create_user_failure(self):
        # Setup mock response
        mock_response = MagicMock()
        mock_response.status_code = 400
        self.mock_session.post.return_value = mock_response

        # Call the method
        user_data = {"name": "New User"}
        result = self.user_service.create_user(user_data)

        # Verify the result
        self.assertIsNone(result)
        self.mock_session.post.assert_called_once_with("https://api.example.com/users", json=user_data)

if __name__ == '__main__':
    unittest.main() 