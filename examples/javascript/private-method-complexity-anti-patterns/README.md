# Private Method Complexity Anti-Patterns

This example demonstrates the Private Method Complexity anti-pattern in JavaScript and how to refactor it for better testability and maintainability.

## Anti-Patterns

1. **Complex Logic Hidden in Private Methods**

   - Business logic is buried in private (non-exported) methods
   - Difficult to test edge cases or error conditions directly
   - Forces tests to go through public interfaces only
   - Makes it hard to isolate and verify specific behaviors

2. **No Dependency Injection for External Checks**
   - Randomness or external checks are hardcoded
   - Cannot mock or control external dependencies in tests

## Solutions

1. **Expose Complex Logic for Direct Testing**

   - Move complex logic to public or static methods
   - Allow direct testing of validation and calculation logic

2. **Use Dependency Injection**

   - Inject randomness and external checks as dependencies
   - Make all logic testable in isolation

3. **Avoid Private Methods for Core Logic**
   - Keep private methods for trivial helpers only
   - Make business logic accessible for testing

## Testing Strategies

1. **Directly Test Validation Logic**

   - Test all edge cases for card validation
   - Cover valid, invalid, and boundary inputs

2. **Directly Test Risk Calculation**

   - Test all risk factors in isolation
   - Inject custom risk checks and randomness for deterministic results

3. **Test Public Methods with Mocks**
   - Mock payment gateway and external dependencies
   - Cover all error and success scenarios

## Key Lessons

1. **Testability Requires Accessibility**

   - If you can't access logic, you can't test it
   - Avoid hiding business logic in private methods

2. **Dependency Injection Enables Control**

   - Inject randomness and external checks for deterministic tests
   - Avoid hardcoded dependencies

3. **Isolate and Test Each Piece**
   - Test validation, calculation, and integration separately
   - Make tests clear and focused

## Running the Tests

```bash
# Install dependencies
npm install

# Run tests
npm test
```

## Files

- `untestable.js` - Demonstrates the private method complexity anti-pattern
- `testable.js` - Refactors the code for testability and exposes complex logic
- `test.js` - Contains tests for the refactored code

</rewritten_file>
