# Private Method Complexity Anti-pattern

This example demonstrates the Private Method Complexity anti-pattern and how to refactor it into a testable solution.

## Anti-pattern Description

The Private Method Complexity anti-pattern occurs when complex logic is hidden within private methods, making it difficult to:

- Test individual validation rules
- Verify edge cases
- Maintain and modify validation logic
- Understand the validation requirements
- Reuse validation logic

## Files

- `untestable.py`: Contains the anti-pattern example with complex private methods
- `testable.py`: Shows how to refactor the code to make it testable
- `test.py`: Contains comprehensive tests for the refactored code

## Key Concepts

1. **Extract Validation Rules**: Move complex validation logic into separate classes
2. **Make Rules Explicit**: Define clear interfaces for validation rules
3. **Enable Testing**: Allow testing of individual validation rules
4. **Dependency Injection**: Make dependencies explicit and injectable
5. **Clear Boundaries**: Separate validation rules from business logic

## Running Tests

To run all tests:

```bash
python -m unittest test.py
```

To run specific test classes:

```bash
python -m unittest test.TestUsernameRule
python -m unittest test.TestPasswordRule
python -m unittest test.TestEmailRule
python -m unittest test.TestAgeRule
python -m unittest test.TestAddressRule
python -m unittest test.TestUserValidator
```

## Example Usage

### Untestable Version

```python
class UserValidator:
    def validate_user(self, user_data):
        # Complex validation logic hidden in private methods
        if not self._validate_username(user_data["username"]):
            return False, "Invalid username"
        if not self._validate_password(user_data["password"]):
            return False, "Invalid password"
        # ... more validation
        return True, None

    def _validate_username(self, username):
        # Complex validation logic
        pass

    def _validate_password(self, password):
        # Complex validation logic
        pass
```

### Testable Version

```python
class UsernameRule(ValidationRule):
    def validate(self, username):
        # Clear, testable validation logic
        if not username:
            return False, "Username cannot be empty"
        if len(username) < 3 or len(username) > 20:
            return False, "Username must be 3-20 characters"
        # ... more validation
        return True, None

class UserValidator:
    def __init__(self, username_rule, password_rule, ...):
        self.username_rule = username_rule
        self.password_rule = password_rule
        # ... more rules

    def validate_user(self, user_data):
        # Clear validation flow
        is_valid, error = self.username_rule.validate(user_data["username"])
        if not is_valid:
            return False, error
        # ... more validation
        return True, None
```

## Benefits of the Testable Solution

1. **Testability**: Each validation rule can be tested independently
2. **Maintainability**: Validation logic is clearly separated and easy to modify
3. **Reusability**: Validation rules can be reused across different validators
4. **Clarity**: Validation requirements are explicit and easy to understand
5. **Flexibility**: Rules can be easily added, removed, or modified
