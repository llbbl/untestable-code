# Hidden Side Effects Anti-Patterns

This example demonstrates the Hidden Side Effects anti-pattern in Python and how to refactor it for better testability and maintainability.

## Anti-Patterns

1. **Unexpected State Modifications**

   - Methods that modify state without clear indication
   - Side effects hidden in implementation details
   - Makes behavior unpredictable and hard to test

2. **External System Interactions**

   - Direct file system operations
   - Logging and monitoring
   - Network calls and database operations
   - Makes tests dependent on external systems

3. **Mixed Responsibilities**
   - Business logic mixed with side effects
   - No clear separation of concerns
   - Makes it difficult to test logic in isolation

## Solutions

1. **Explicit Side Effects**

   - Make side effects clear in method signatures
   - Use dependency injection for external systems
   - Separate business logic from side effects

2. **Interface Abstraction**

   - Define clear interfaces for side effects
   - Use abstract base classes for dependencies
   - Make dependencies injectable and mockable

3. **Pure Business Logic**
   - Keep business logic pure and side-effect free
   - Move side effects to the edges of the system
   - Make behavior predictable and testable

## Testing Strategies

1. **Mock Dependencies**

   - Use mock objects for side effects
   - Verify side effect interactions
   - Test business logic in isolation

2. **Verify Side Effects**

   - Test that side effects occur correctly
   - Verify the order and content of side effects
   - Ensure side effects are intentional

3. **Isolate Business Logic**
   - Test business logic without side effects
   - Verify behavior with different inputs
   - Ensure logic is correct and complete

## Key Lessons

1. **Side Effects Should Be Explicit**

   - Makes code easier to understand
   - Helps prevent bugs and surprises
   - Makes testing more straightforward

2. **Separate Concerns**
   - Keep business logic pure
   - Move side effects to the edges
   - Makes code more maintainable

## Running the Tests

```bash
# Run tests
python -m unittest test.py
```

## Files

- `untestable.py` - Demonstrates the hidden side effects anti-pattern
- `testable.py` - Refactors the code to make side effects explicit and injectable
- `test.py` - Contains tests for the refactored code
