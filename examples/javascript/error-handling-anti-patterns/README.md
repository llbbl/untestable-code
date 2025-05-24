# Error Handling Anti-Patterns

This example demonstrates common error handling anti-patterns in JavaScript and how to refactor them for better testability and maintainability.

## Anti-Patterns

1. **Swallowing Errors**

   - Silently catching and ignoring errors
   - Logging errors without proper handling
   - Returning null/undefined instead of throwing errors

2. **Generic Error Handling**

   - Using generic Error class for all errors
   - Not distinguishing between different error types
   - Missing error context and details

3. **Inconsistent Error Handling**

   - Different error handling patterns in the same codebase
   - Mixing error handling styles
   - Inconsistent error propagation

4. **Error Type Confusion**

   - Not distinguishing between expected and unexpected errors
   - Treating all errors the same way
   - Missing error type hierarchy

5. **Error Propagation Issues**

   - Not properly propagating errors up the call stack
   - Losing error context during propagation
   - Not handling errors at the right level

6. **Missing Error Context**
   - Not including relevant data in error messages
   - Missing stack traces
   - Not preserving original error information

## Solutions

1. **Custom Error Classes**

   - Create specific error types for different scenarios
   - Inherit from base error classes
   - Include relevant context in error objects

2. **Consistent Error Handling**

   - Use consistent error handling patterns
   - Handle errors at appropriate levels
   - Follow error handling best practices

3. **Error Context Preservation**

   - Include relevant data in error objects
   - Preserve original error information
   - Add context to error messages

4. **Proper Error Propagation**

   - Propagate errors up the call stack
   - Handle errors at appropriate levels
   - Maintain error context during propagation

5. **Error Type Safety**

   - Use type checking for errors
   - Distinguish between expected and unexpected errors
   - Handle different error types appropriately

6. **Error Recovery Strategies**
   - Implement retry mechanisms
   - Provide fallback behavior
   - Handle partial failures gracefully

## Testing Strategies

1. **Testing Custom Error Classes**

   - Verify error inheritance
   - Check error properties
   - Validate error context

2. **Testing Error Context**

   - Verify error messages
   - Check included context
   - Validate error properties

3. **Testing Error Propagation**

   - Verify error handling at different levels
   - Check error transformation
   - Validate error context preservation

4. **Testing Error Recovery**

   - Verify retry mechanisms
   - Check fallback behavior
   - Validate partial failure handling

5. **Testing Error Boundaries**

   - Verify error isolation
   - Check error containment
   - Validate error handling scope

6. **Testing Error Logging**
   - Verify error logging
   - Check log levels
   - Validate log messages

## Key Lessons

1. **Error Types**

   - Use specific error types
   - Create error hierarchies
   - Include relevant context

2. **Error Handling**

   - Handle errors consistently
   - Propagate errors properly
   - Preserve error context

3. **Error Recovery**

   - Implement retry mechanisms
   - Provide fallback behavior
   - Handle partial failures

4. **Error Testing**
   - Test error scenarios
   - Verify error handling
   - Validate error recovery

## Running the Tests

```bash
# Install dependencies
npm install

# Run tests
npm test
```

## Files

- `untestable.js` - Demonstrates common error handling anti-patterns
- `testable.js` - Shows how to refactor the code for better error handling
- `test.js` - Contains tests for the refactored code
