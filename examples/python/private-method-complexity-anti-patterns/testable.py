"""
This example demonstrates a testable approach to complex validation logic:

1. Extract validation logic into separate classes
2. Make validation rules explicit and testable
3. Allow testing of individual validation rules
4. Make dependencies explicit and injectable
5. Create clear boundaries between components
"""

import re
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Dict, List, Optional, Protocol, Set, Tuple


class ValidationRule(ABC):
    """Base class for validation rules"""
    @abstractmethod
    def validate(self, value: any) -> Tuple[bool, Optional[str]]:
        """Validate a value and return (is_valid, error_message)"""
        pass


class UsernameRule(ValidationRule):
    """Username validation rules"""
    def validate(self, username: str) -> Tuple[bool, Optional[str]]:
        if not username:
            return False, "Username cannot be empty"

        if not (3 <= len(username) <= 20):
            return False, "Username must be 3-20 characters"

        if not re.match(r"^[a-zA-Z0-9_]+$", username):
            return False, "Username can only contain letters, numbers, and underscores"

        if username[0].isdigit():
            return False, "Username cannot start with a number"

        return True, None


class PasswordRule(ValidationRule):
    """Password validation rules"""
    def __init__(self, password_history: List[str], last_password_change: Optional[datetime]):
        self.password_history = password_history
        self.last_password_change = last_password_change

    def validate(self, password: str) -> Tuple[bool, Optional[str]]:
        if not password:
            return False, "Password cannot be empty"

        if len(password) < 8:
            return False, "Password must be at least 8 characters"

        if not any(c.isupper() for c in password):
            return False, "Password must contain at least one uppercase letter"

        if not any(c.islower() for c in password):
            return False, "Password must contain at least one lowercase letter"

        if not any(c.isdigit() for c in password):
            return False, "Password must contain at least one number"

        if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
            return False, "Password must contain at least one special character"

        if password in self.password_history:
            return False, "Password cannot be reused"

        if self.last_password_change:
            days_since_change = (datetime.now() - self.last_password_change).days
            if days_since_change > 90:
                return False, "Password must be changed every 90 days"

        return True, None


class EmailRule(ValidationRule):
    """Email validation rules"""
    def __init__(self, valid_tlds: Set[str]):
        self.valid_tlds = valid_tlds

    def validate(self, email: str) -> Tuple[bool, Optional[str]]:
        if not email:
            return False, "Email cannot be empty"

        email_pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        if not re.match(email_pattern, email):
            return False, "Invalid email format"

        domain = email.split("@")[1]
        if not self._is_valid_domain(domain):
            return False, "Invalid domain"

        return True, None

    def _is_valid_domain(self, domain: str) -> bool:
        if "." not in domain:
            return False

        parts = domain.split(".")
        if len(parts) < 2:
            return False

        if parts[-1].lower() not in self.valid_tlds:
            return False

        domain_name = ".".join(parts[:-1])
        if not re.match(r"^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*$", domain_name):
            return False

        return True


class AgeRule(ValidationRule):
    """Age validation rules"""
    def validate(self, age: int) -> Tuple[bool, Optional[str]]:
        if not isinstance(age, int):
            return False, "Age must be a number"

        if age <= 0:
            return False, "Age must be positive"

        if not (0 <= age <= 150):
            return False, "Age must be between 0 and 150"

        return True, None


class AddressRule(ValidationRule):
    """Address validation rules"""
    def __init__(self, valid_states: Set[str], valid_countries: Set[str]):
        self.valid_states = valid_states
        self.valid_countries = valid_countries

    def validate(self, address: Dict) -> Tuple[bool, Optional[str]]:
        required_fields = {"street", "city", "state", "zip_code", "country"}
        if not all(field in address for field in required_fields):
            return False, "Missing required address fields"

        # Validate street
        if not address["street"] or len(address["street"]) < 5:
            return False, "Invalid street address"

        # Validate city
        if not address["city"] or len(address["city"]) < 2:
            return False, "Invalid city"

        # Validate state
        if address["state"].upper() not in self.valid_states:
            return False, "Invalid state"

        # Validate zip code
        if not re.match(r"^\d{5}(-\d{4})?$", address["zip_code"]):
            return False, "Invalid zip code"

        # Validate country
        if address["country"] not in self.valid_countries:
            return False, "Invalid country"

        return True, None


class UserValidator:
    """User validation using explicit validation rules"""
    def __init__(
        self,
        username_rule: ValidationRule,
        password_rule: ValidationRule,
        email_rule: ValidationRule,
        age_rule: ValidationRule,
        address_rule: ValidationRule
    ):
        self.username_rule = username_rule
        self.password_rule = password_rule
        self.email_rule = email_rule
        self.age_rule = age_rule
        self.address_rule = address_rule

    def validate_user(self, user_data: Dict) -> Tuple[bool, Optional[str]]:
        """Validate user data using injected validation rules"""
        try:
            # Validate username
            is_valid, error = self.username_rule.validate(user_data.get("username", ""))
            if not is_valid:
                return False, error

            # Validate password
            is_valid, error = self.password_rule.validate(user_data.get("password", ""))
            if not is_valid:
                return False, error

            # Validate email
            is_valid, error = self.email_rule.validate(user_data.get("email", ""))
            if not is_valid:
                return False, error

            # Validate age
            is_valid, error = self.age_rule.validate(user_data.get("age", 0))
            if not is_valid:
                return False, error

            # Validate address
            is_valid, error = self.address_rule.validate(user_data.get("address", {}))
            if not is_valid:
                return False, error

            return True, None

        except Exception as e:
            return False, str(e)


# Factory function to create UserValidator with default rules
def create_user_validator(
    password_history: List[str] = None,
    last_password_change: Optional[datetime] = None
) -> UserValidator:
    """Create a UserValidator with default validation rules"""
    return UserValidator(
        username_rule=UsernameRule(),
        password_rule=PasswordRule(
            password_history=password_history or [],
            last_password_change=last_password_change
        ),
        email_rule=EmailRule(valid_tlds={"com", "org", "net", "edu", "gov", "io"}),
        age_rule=AgeRule(),
        address_rule=AddressRule(
            valid_states={
                "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
                "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
                "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
                "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
                "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
            },
            valid_countries={"USA", "Canada", "Mexico", "UK", "France", "Germany"}
        )
    ) 