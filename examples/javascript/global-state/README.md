# Global State and Module Scope Pollution Example

This example demonstrates how global state and module scope pollution in JavaScript makes code difficult to test, and how to refactor it to be more testable.

## The Problem

The `untestable.js` file demonstrates several anti-patterns that make code difficult to test:

1. **Global State**

   - Global configuration object
   - Global cache
   - Global database connection
   - Module-level state (request count, last request time)

2. **Testing Challenges**
   - Tests cannot run in isolation
   - State leaks between tests
   - Order-dependent test execution
   - Difficult to mock global dependencies
   - Cannot reset state between tests
   - Cannot control external dependencies

## The Solution

The `testable.js` file shows how to refactor the code to be more testable:

1. **Dependency Injection**

   - All dependencies are injected through the constructor
   - Dependencies are explicit and can be easily mocked
   - No global state or module-level variables

2. **Encapsulated State**

   - State is contained within class instances
   - Each instance has its own isolated state
   - State can be easily reset between tests

3. **Clear Interfaces**
   - Dependencies are defined by clear interfaces
   - Easy to create mock implementations
   - Easy to verify behavior

## Testing

The `test.js` file demonstrates how to test the refactored code:

1. **Test Setup**

   - Each test gets a fresh instance of the service
   - Dependencies are mocked and controlled
   - State is isolated between tests

2. **Test Cases**

   - Cache hit scenario
   - Cache miss scenario
   - Error handling
   - State management

3. **Benefits**
   - Tests are isolated and independent
   - No global state to manage
   - Clear test boundaries
   - Easy to verify behavior
   - Easy to mock dependencies

## Key Lessons

1. **Avoid Global State**

   - Use dependency injection
   - Encapsulate state in classes
   - Make dependencies explicit

2. **Design for Testing**

   - Consider testability when designing code
   - Make dependencies injectable
   - Keep state isolated

3. **Clear Boundaries**
   - Define clear interfaces
   - Separate concerns
   - Make behavior verifiable

## Running the Tests

```bash
# Install dependencies
npm install

# Run tests
npm test
```

## Notes

- This example uses Jest for testing
- The code is simplified for demonstration purposes
- Real-world applications might have additional complexity
- The principles apply to any JavaScript/TypeScript codebase
