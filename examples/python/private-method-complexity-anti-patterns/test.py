"""
This example demonstrates how to test validation rules:

1. Test individual validation rules
2. Test edge cases and error conditions
3. Test rule combinations
4. Test with mock dependencies
5. Test error messages
"""

import unittest
from datetime import datetime, timedelta
from unittest.mock import Mock
from testable import (
    ValidationRule, UsernameRule, PasswordRule, EmailRule,
    AgeRule, AddressRule, UserValidator, create_user_validator
)


class TestUsernameRule(unittest.TestCase):
    def setUp(self):
        self.rule = UsernameRule()

    def test_valid_username(self):
        is_valid, error = self.rule.validate("valid_user123")
        self.assertTrue(is_valid)
        self.assertIsNone(error)

    def test_empty_username(self):
        is_valid, error = self.rule.validate("")
        self.assertFalse(is_valid)
        self.assertEqual(error, "Username cannot be empty")

    def test_username_too_short(self):
        is_valid, error = self.rule.validate("ab")
        self.assertFalse(is_valid)
        self.assertEqual(error, "Username must be 3-20 characters")

    def test_username_too_long(self):
        is_valid, error = self.rule.validate("a" * 21)
        self.assertFalse(is_valid)
        self.assertEqual(error, "Username must be 3-20 characters")

    def test_username_invalid_chars(self):
        is_valid, error = self.rule.validate("user@name")
        self.assertFalse(is_valid)
        self.assertEqual(error, "Username can only contain letters, numbers, and underscores")

    def test_username_starts_with_number(self):
        is_valid, error = self.rule.validate("1username")
        self.assertFalse(is_valid)
        self.assertEqual(error, "Username cannot start with a number")


class TestPasswordRule(unittest.TestCase):
    def setUp(self):
        self.password_history = ["old_password123"]
        self.last_password_change = datetime.now() - timedelta(days=30)
        self.rule = PasswordRule(self.password_history, self.last_password_change)

    def test_valid_password(self):
        is_valid, error = self.rule.validate("ValidPass123!")
        self.assertTrue(is_valid)
        self.assertIsNone(error)

    def test_empty_password(self):
        is_valid, error = self.rule.validate("")
        self.assertFalse(is_valid)
        self.assertEqual(error, "Password cannot be empty")

    def test_password_too_short(self):
        is_valid, error = self.rule.validate("Pass1!")
        self.assertFalse(is_valid)
        self.assertEqual(error, "Password must be at least 8 characters")

    def test_password_no_uppercase(self):
        is_valid, error = self.rule.validate("password123!")
        self.assertFalse(is_valid)
        self.assertEqual(error, "Password must contain at least one uppercase letter")

    def test_password_no_lowercase(self):
        is_valid, error = self.rule.validate("PASSWORD123!")
        self.assertFalse(is_valid)
        self.assertEqual(error, "Password must contain at least one lowercase letter")

    def test_password_no_number(self):
        is_valid, error = self.rule.validate("Password!")
        self.assertFalse(is_valid)
        self.assertEqual(error, "Password must contain at least one number")

    def test_password_no_special_char(self):
        is_valid, error = self.rule.validate("Password123")
        self.assertFalse(is_valid)
        self.assertEqual(error, "Password must contain at least one special character")

    def test_password_in_history(self):
        is_valid, error = self.rule.validate("old_password123")
        self.assertFalse(is_valid)
        self.assertEqual(error, "Password cannot be reused")

    def test_password_expired(self):
        rule = PasswordRule([], datetime.now() - timedelta(days=91))
        is_valid, error = rule.validate("ValidPass123!")
        self.assertFalse(is_valid)
        self.assertEqual(error, "Password must be changed every 90 days")


class TestEmailRule(unittest.TestCase):
    def setUp(self):
        self.rule = EmailRule(valid_tlds={"com", "org", "net"})

    def test_valid_email(self):
        is_valid, error = self.rule.validate("user@example.com")
        self.assertTrue(is_valid)
        self.assertIsNone(error)

    def test_empty_email(self):
        is_valid, error = self.rule.validate("")
        self.assertFalse(is_valid)
        self.assertEqual(error, "Email cannot be empty")

    def test_invalid_format(self):
        is_valid, error = self.rule.validate("invalid-email")
        self.assertFalse(is_valid)
        self.assertEqual(error, "Invalid email format")

    def test_invalid_tld(self):
        is_valid, error = self.rule.validate("user@example.invalid")
        self.assertFalse(is_valid)
        self.assertEqual(error, "Invalid domain")


class TestAgeRule(unittest.TestCase):
    def setUp(self):
        self.rule = AgeRule()

    def test_valid_age(self):
        is_valid, error = self.rule.validate(25)
        self.assertTrue(is_valid)
        self.assertIsNone(error)

    def test_invalid_type(self):
        is_valid, error = self.rule.validate("25")
        self.assertFalse(is_valid)
        self.assertEqual(error, "Age must be a number")

    def test_negative_age(self):
        is_valid, error = self.rule.validate(-1)
        self.assertFalse(is_valid)
        self.assertEqual(error, "Age must be positive")

    def test_age_too_high(self):
        is_valid, error = self.rule.validate(151)
        self.assertFalse(is_valid)
        self.assertEqual(error, "Age must be between 0 and 150")


class TestAddressRule(unittest.TestCase):
    def setUp(self):
        self.rule = AddressRule(
            valid_states={"CA", "NY"},
            valid_countries={"USA", "Canada"}
        )

    def test_valid_address(self):
        address = {
            "street": "123 Main St",
            "city": "San Francisco",
            "state": "CA",
            "zip_code": "94105",
            "country": "USA"
        }
        is_valid, error = self.rule.validate(address)
        self.assertTrue(is_valid)
        self.assertIsNone(error)

    def test_missing_fields(self):
        address = {
            "street": "123 Main St",
            "city": "San Francisco"
        }
        is_valid, error = self.rule.validate(address)
        self.assertFalse(is_valid)
        self.assertEqual(error, "Missing required address fields")

    def test_invalid_street(self):
        address = {
            "street": "123",
            "city": "San Francisco",
            "state": "CA",
            "zip_code": "94105",
            "country": "USA"
        }
        is_valid, error = self.rule.validate(address)
        self.assertFalse(is_valid)
        self.assertEqual(error, "Invalid street address")

    def test_invalid_state(self):
        address = {
            "street": "123 Main St",
            "city": "San Francisco",
            "state": "INVALID",
            "zip_code": "94105",
            "country": "USA"
        }
        is_valid, error = self.rule.validate(address)
        self.assertFalse(is_valid)
        self.assertEqual(error, "Invalid state")

    def test_invalid_zip_code(self):
        address = {
            "street": "123 Main St",
            "city": "San Francisco",
            "state": "CA",
            "zip_code": "invalid",
            "country": "USA"
        }
        is_valid, error = self.rule.validate(address)
        self.assertFalse(is_valid)
        self.assertEqual(error, "Invalid zip code")

    def test_invalid_country(self):
        address = {
            "street": "123 Main St",
            "city": "San Francisco",
            "state": "CA",
            "zip_code": "94105",
            "country": "Invalid"
        }
        is_valid, error = self.rule.validate(address)
        self.assertFalse(is_valid)
        self.assertEqual(error, "Invalid country")


class TestUserValidator(unittest.TestCase):
    def setUp(self):
        # Create mock validation rules
        self.username_rule = Mock(spec=ValidationRule)
        self.password_rule = Mock(spec=ValidationRule)
        self.email_rule = Mock(spec=ValidationRule)
        self.age_rule = Mock(spec=ValidationRule)
        self.address_rule = Mock(spec=ValidationRule)

        # Create validator with mock rules
        self.validator = UserValidator(
            username_rule=self.username_rule,
            password_rule=self.password_rule,
            email_rule=self.email_rule,
            age_rule=self.age_rule,
            address_rule=self.address_rule
        )

        # Sample user data
        self.user_data = {
            "username": "test_user",
            "password": "TestPass123!",
            "email": "test@example.com",
            "age": 25,
            "address": {
                "street": "123 Main St",
                "city": "San Francisco",
                "state": "CA",
                "zip_code": "94105",
                "country": "USA"
            }
        }

    def test_valid_user(self):
        # Setup mock rules to return valid
        self.username_rule.validate.return_value = (True, None)
        self.password_rule.validate.return_value = (True, None)
        self.email_rule.validate.return_value = (True, None)
        self.age_rule.validate.return_value = (True, None)
        self.address_rule.validate.return_value = (True, None)

        # Test validation
        is_valid, error = self.validator.validate_user(self.user_data)
        self.assertTrue(is_valid)
        self.assertIsNone(error)

        # Verify all rules were called
        self.username_rule.validate.assert_called_once_with("test_user")
        self.password_rule.validate.assert_called_once_with("TestPass123!")
        self.email_rule.validate.assert_called_once_with("test@example.com")
        self.age_rule.validate.assert_called_once_with(25)
        self.address_rule.validate.assert_called_once_with(self.user_data["address"])

    def test_invalid_username(self):
        # Setup mock rules
        self.username_rule.validate.return_value = (False, "Invalid username")
        self.password_rule.validate.return_value = (True, None)
        self.email_rule.validate.return_value = (True, None)
        self.age_rule.validate.return_value = (True, None)
        self.address_rule.validate.return_value = (True, None)

        # Test validation
        is_valid, error = self.validator.validate_user(self.user_data)
        self.assertFalse(is_valid)
        self.assertEqual(error, "Invalid username")

        # Verify only username rule was called
        self.username_rule.validate.assert_called_once()
        self.password_rule.validate.assert_not_called()
        self.email_rule.validate.assert_not_called()
        self.age_rule.validate.assert_not_called()
        self.address_rule.validate.assert_not_called()

    def test_exception_handling(self):
        # Setup mock rule to raise exception
        self.username_rule.validate.side_effect = Exception("Test error")

        # Test validation
        is_valid, error = self.validator.validate_user(self.user_data)
        self.assertFalse(is_valid)
        self.assertEqual(error, "Test error")


if __name__ == '__main__':
    unittest.main() 