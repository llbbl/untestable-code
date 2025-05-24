# Tight Coupling Anti-Patterns

This example demonstrates the Tight Coupling anti-pattern in JavaScript and how to refactor it for better testability and maintainability.

## Anti-Patterns

1. **Highly Dependent Classes/Modules**

   - Classes directly instantiate and depend on each other
   - No clear separation of concerns
   - Changes in one class ripple through others

2. **Difficult to Test in Isolation**
   - Cannot mock or replace dependencies easily
   - Tests require real implementations of all dependencies
   - Hard to verify interactions and edge cases

## Solutions

1. **Dependency Injection**

   - Pass dependencies (like EmailService and Logger) into constructors
   - Allows for easy mocking and replacement in tests

2. **Separation of Concerns**

   - Keep business logic, email, and logging responsibilities separate
   - Each component has a single responsibility

3. **Testable in Isolation**
   - Each class can be tested independently with mocks
   - Interactions and side effects are easy to verify

## Testing Strategies

1. **Test Each Component in Isolation**

   - Mock dependencies for UserService and EmailService
   - Verify only the relevant interactions

2. **Cover Edge Cases**

   - Test missing data, error handling, and all code paths

3. **Verify Interactions**
   - Ensure correct methods are called on dependencies
   - Check that logs and emails are triggered as expected

## Key Lessons

1. **Loose Coupling Improves Testability**

   - Decoupled code is easier to test, maintain, and extend

2. **Dependency Injection Enables Control**

   - You can mock, replace, or spy on dependencies in tests

3. **Separation of Concerns Reduces Ripple Effects**
   - Changes in one class don't break others

## Running the Tests

```bash
# Install dependencies
npm install

# Run tests
npm test
```

## Files

- `untestable.js` - Demonstrates the tight coupling anti-pattern
- `testable.js` - Refactors the code for testability and decoupling
- `test.js` - Contains tests for the refactored code
