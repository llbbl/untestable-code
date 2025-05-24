# Asynchronous Code Anti-Patterns Example

This example demonstrates common asynchronous code anti-patterns that make testing difficult, and how to refactor them into testable code.

## The Problem

The `untestable.js` file demonstrates several anti-patterns that make asynchronous code difficult to test:

1. **Callback Hell**

   - Nested callbacks make code hard to follow
   - Error handling is scattered
   - Flow control is complex
   - Testing requires complex setup

2. **Mixed Async Patterns**

   - Mixing callbacks and Promises
   - Inconsistent error handling
   - Unclear control flow
   - Difficult to test edge cases

3. **Unhandled Promise Rejections**

   - Swallowed errors
   - Missing error propagation
   - Unclear error boundaries
   - Hard to test error scenarios

4. **Race Conditions**

   - Uncontrolled state access
   - Timing-dependent behavior
   - Non-deterministic results
   - Flaky tests

5. **Timeout Handling Issues**

   - Uncontrolled timeouts
   - Side effects after timeout
   - Resource leaks
   - Difficult to test timeout scenarios

6. **Uncontrolled Side Effects**
   - Global state mutations
   - Hidden dependencies
   - Unclear boundaries
   - Hard to isolate tests

## The Solution

The `testable.js` file shows how to refactor the code to be more testable:

1. **Consistent Async Patterns**

   - Using async/await consistently
   - Clear error boundaries
   - Predictable control flow
   - Easy to test

2. **Proper Error Handling**

   - Explicit error propagation
   - Clear error boundaries
   - Consistent error types
   - Easy to test error cases

3. **Controlled Timeouts**

   - Using AbortController
   - Proper cleanup
   - Clear timeout boundaries
   - Easy to test timeout scenarios

4. **Dependency Injection**

   - All dependencies are injected
   - Easy to mock
   - Clear boundaries
   - Isolated tests

5. **Isolated State**

   - State is encapsulated
   - Clear ownership
   - Predictable mutations
   - Easy to verify state

6. **Clear Boundaries**
   - Explicit interfaces
   - Clear responsibilities
   - Predictable behavior
   - Easy to test

## Testing

The `test.js` file demonstrates how to test the refactored code:

1. **Test Setup**

   - Mock dependencies
   - Clear test boundaries
   - Isolated state
   - Predictable behavior

2. **Test Cases**

   - Success scenarios
   - Error scenarios
   - Timeout scenarios
   - State verification

3. **Benefits**
   - Reliable tests
   - Clear test boundaries
   - Easy to maintain
   - Good coverage

## Key Lessons

1. **Use Consistent Patterns**

   - Stick to async/await
   - Clear error handling
   - Predictable flow
   - Easy to test

2. **Handle Errors Properly**

   - Explicit error handling
   - Clear error boundaries
   - Consistent error types
   - Easy to test

3. **Control Side Effects**
   - Dependency injection
   - Isolated state
   - Clear boundaries
   - Easy to verify

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
