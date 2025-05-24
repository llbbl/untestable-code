"""
This example demonstrates the Private Method Complexity anti-pattern:

1. Complex logic hidden in private methods
2. No way to test edge cases or error conditions
3. Forced to test through public interfaces only
4. Difficult to verify internal behavior
5. Hard to maintain and modify
"""

import re
from datetime import datetime
from typing import Dict, List, Optional, Tuple


class UserValidator:
    def __init__(self):
        self._password_history: List[str] = []
        self._last_password_change: Optional[datetime] = None

    def validate_user(self, user_data: Dict) -> Tuple[bool, Optional[str]]:
        """
        Validates user data including password requirements and personal information.
        Complex validation logic is hidden in private methods.
        """
        try:
            # Validate username
            if not self._validate_username(user_data.get("username", "")):
                return False, "Invalid username format"

            # Validate password
            password = user_data.get("password", "")
            if not self._validate_password(password):
                return False, "Password does not meet requirements"

            # Validate email
            if not self._validate_email(user_data.get("email", "")):
                return False, "Invalid email format"

            # Validate age
            if not self._validate_age(user_data.get("age", 0)):
                return False, "Invalid age"

            # Validate address
            if not self._validate_address(user_data.get("address", {})):
                return False, "Invalid address"

            return True, None

        except Exception as e:
            return False, str(e)

    def _validate_username(self, username: str) -> bool:
        """
        Complex username validation logic hidden in private method.
        Cannot be tested directly.
        """
        if not username:
            return False

        # Username must be 3-20 characters
        if not (3 <= len(username) <= 20):
            return False

        # Username can only contain letters, numbers, and underscores
        if not re.match(r"^[a-zA-Z0-9_]+$", username):
            return False

        # Username cannot start with a number
        if username[0].isdigit():
            return False

        return True

    def _validate_password(self, password: str) -> bool:
        """
        Complex password validation logic hidden in private method.
        Cannot be tested directly.
        """
        if not password:
            return False

        # Password must be at least 8 characters
        if len(password) < 8:
            return False

        # Password must contain at least one uppercase letter
        if not any(c.isupper() for c in password):
            return False

        # Password must contain at least one lowercase letter
        if not any(c.islower() for c in password):
            return False

        # Password must contain at least one number
        if not any(c.isdigit() for c in password):
            return False

        # Password must contain at least one special character
        if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
            return False

        # Password cannot be in password history
        if password in self._password_history:
            return False

        # Password must be changed every 90 days
        if self._last_password_change:
            days_since_change = (datetime.now() - self._last_password_change).days
            if days_since_change > 90:
                return False

        return True

    def _validate_email(self, email: str) -> bool:
        """
        Complex email validation logic hidden in private method.
        Cannot be tested directly.
        """
        if not email:
            return False

        # Basic email format validation
        email_pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        if not re.match(email_pattern, email):
            return False

        # Domain must be valid
        domain = email.split("@")[1]
        if not self._is_valid_domain(domain):
            return False

        return True

    def _is_valid_domain(self, domain: str) -> bool:
        """
        Complex domain validation logic hidden in private method.
        Cannot be tested directly.
        """
        # Domain must have at least one dot
        if "." not in domain:
            return False

        # Domain parts must be valid
        parts = domain.split(".")
        if len(parts) < 2:
            return False

        # TLD must be valid
        valid_tlds = {"com", "org", "net", "edu", "gov", "io"}
        if parts[-1].lower() not in valid_tlds:
            return False

        # Domain name must be valid
        domain_name = ".".join(parts[:-1])
        if not re.match(r"^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*$", domain_name):
            return False

        return True

    def _validate_age(self, age: int) -> bool:
        """
        Complex age validation logic hidden in private method.
        Cannot be tested directly.
        """
        # Age must be a positive number
        if not isinstance(age, int) or age <= 0:
            return False

        # Age must be reasonable (0-150)
        if not (0 <= age <= 150):
            return False

        return True

    def _validate_address(self, address: Dict) -> bool:
        """
        Complex address validation logic hidden in private method.
        Cannot be tested directly.
        """
        required_fields = {"street", "city", "state", "zip_code", "country"}
        if not all(field in address for field in required_fields):
            return False

        # Validate street
        if not self._validate_street(address["street"]):
            return False

        # Validate city
        if not self._validate_city(address["city"]):
            return False

        # Validate state
        if not self._validate_state(address["state"]):
            return False

        # Validate zip code
        if not self._validate_zip_code(address["zip_code"]):
            return False

        # Validate country
        if not self._validate_country(address["country"]):
            return False

        return True

    def _validate_street(self, street: str) -> bool:
        """Complex street validation logic hidden in private method."""
        if not street or len(street) < 5:
            return False
        return True

    def _validate_city(self, city: str) -> bool:
        """Complex city validation logic hidden in private method."""
        if not city or len(city) < 2:
            return False
        return True

    def _validate_state(self, state: str) -> bool:
        """Complex state validation logic hidden in private method."""
        valid_states = {
            "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
            "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
            "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
            "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
            "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
        }
        return state.upper() in valid_states

    def _validate_zip_code(self, zip_code: str) -> bool:
        """Complex zip code validation logic hidden in private method."""
        if not zip_code:
            return False
        return bool(re.match(r"^\d{5}(-\d{4})?$", zip_code))

    def _validate_country(self, country: str) -> bool:
        """Complex country validation logic hidden in private method."""
        valid_countries = {"USA", "Canada", "Mexico", "UK", "France", "Germany"}
        return country in valid_countries 