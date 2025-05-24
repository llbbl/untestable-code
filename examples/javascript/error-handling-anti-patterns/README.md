# Error Handling Anti-Patterns Example

This example demonstrates common error handling anti-patterns that make testing difficult, and how to refactor them into testable code.

## The Problem

The `untestable.js` file demonstrates several anti-patterns that make code difficult to test:

1. **Swallowing Errors**

   - Errors are caught and silently logged
   - No error propagation
   - Difficult to test error cases
   - Hidden failure modes

2. **Generic Error Handling**

   - All errors are treated the same
   - No error type differentiation
   - Difficult to test specific error cases
   - Loss of error context

3. **Inconsistent Error Handling**

   - Different methods handle errors differently
   - No standard error handling pattern
   - Difficult to test error cases consistently
   - Unpredictable behavior

4. **Error State Mutation**

   - Global error state
   - Side effects in error handling
   - Difficult to test error cases in isolation
   - State leaks between tests

5. **Unhandled Promise Rejections**

   - Promises without error handling
   - Global unhandled rejection handler
   - Difficult to test error cases
   - Unpredictable behavior

6. **Error Propagation Issues**
   - Lost error context
   - Generic error messages
   - Difficult to debug issues
   - Hard to test error cases

## The Solution

The `testable.js` file shows how to refactor the code to be more testable:

1. **Custom Error Classes**

   - Domain-specific error types
   - Error codes for categorization
   - Error context preservation
   - Easy to test error types

2. **Consistent Error Handling**

   - Standard error handling pattern
   - Clear error boundaries
   - Predictable behavior
   - Easy to test error cases

3. **Proper Error Propagation**

   - Error context preservation
   - Clear error boundaries
   - Error type preservation
   - Easy to test error flow

4. **Error Context Preservation**

   - Original error as cause
   - Detailed error messages
   - Error type information
   - Easy to debug issues

5. **Promise Error Handling**

   - Proper promise error handling
   - No unhandled rejections
   - Clear error boundaries
   - Easy to test async errors

6. **Error Boundaries**
   - Clear error handling boundaries
   - Consistent error handling
   - No global error state
   - Easy to test error cases

## Testing

The `test.js` file demonstrates how to test the refactored code:

1. **Test Setup**

   - Mock dependencies
   - Clear test boundaries
   - Isolated tests
   - Predictable behavior

2. **Test Cases**

   - Success scenarios
   - Error scenarios
   - Error type verification
   - Error context verification

3. **Benefits**
   - Reliable tests
   - Clear test boundaries
   - Easy to maintain
   - Good coverage

## Key Lessons

1. **Use Custom Error Classes**

   - Define domain-specific errors
   - Include error codes
   - Preserve error context
   - Make errors testable

2. **Handle Errors Consistently**

   - Use standard patterns
   - Clear error boundaries
   - Proper error propagation
   - Make error handling testable

3. **Design for Testing**
   - Consider error cases
   - Make errors verifiable
   - Keep error handling clear
   - Make error flow testable

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
