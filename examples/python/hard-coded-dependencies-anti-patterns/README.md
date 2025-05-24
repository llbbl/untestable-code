# Hard-coded Dependencies Anti-Patterns

This example demonstrates the Hard-coded Dependencies anti-pattern in Python and how to refactor it for better testability and maintainability.

## Anti-Patterns

1. **Direct Instantiation of Dependencies**

   - Dependencies (like requests.Session) are directly instantiated within classes
   - No way to inject mock objects or test doubles
   - Makes unit testing impossible without modifying the code

2. **Tight Coupling to External Libraries**
   - Classes are tightly coupled to specific implementations
   - Hard to swap out dependencies for testing or different environments

## Solutions

1. **Dependency Injection**

   - Pass dependencies (like session) into constructors
   - Allows for easy mocking and replacement in tests

2. **Default Dependencies**
   - Provide sensible defaults while still allowing injection
   - Makes the code flexible and testable

## Testing Strategies

1. **Mock Dependencies**

   - Use unittest.mock to create mock sessions
   - Simulate HTTP responses and test edge cases

2. **Test Edge Cases**
   - Cover success and failure scenarios
   - Verify correct interaction with dependencies

## Key Lessons

1. **Dependency Injection Improves Testability**

   - Decoupled code is easier to test and maintain

2. **Mocks Enable Isolated Testing**
   - You can test your code without real external dependencies

## Running the Tests

```bash
# Install dependencies
pip install requests

# Run tests
python -m unittest test.py
```

## Files

- `untestable.py` - Demonstrates the hard-coded dependencies anti-pattern
- `testable.py` - Refactors the code for testability using dependency injection
- `test.py` - Contains tests for the refactored code
