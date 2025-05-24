# Global State Anti-Patterns

This example demonstrates the Global State anti-pattern in Python and how to refactor it for better testability and maintainability.

## Anti-Patterns

1. **Shared Mutable State**

   - State is shared across multiple components
   - Changes in one place affect behavior elsewhere
   - Makes tests non-deterministic

2. **Static Variables and Singletons**

   - State is maintained in class-level variables
   - No way to reset state between tests
   - Tests become dependent on execution order

3. **State-Dependent Behavior**
   - Business logic depends on global state
   - Hard to test specific scenarios
   - Difficult to reason about code behavior

## Solutions

1. **Instance State**

   - Keep state at the instance level
   - Each object has its own isolated state
   - Makes behavior predictable and testable

2. **Dependency Injection**

   - Pass stateful components as dependencies
   - Allows for easy mocking and replacement
   - Makes testing easier and more reliable

3. **Immutable State**
   - Use immutable data structures where possible
   - Make state changes explicit
   - Reduces complexity and side effects

## Testing Strategies

1. **Isolated State**

   - Each test gets its own fresh state
   - No shared state between tests
   - Tests are independent and deterministic

2. **State Verification**

   - Verify state changes explicitly
   - Test both the final state and the process
   - Ensure state changes are intentional

3. **Edge Cases**
   - Test state transitions
   - Verify state cleanup
   - Check error conditions

## Key Lessons

1. **Global State is Problematic**

   - Makes code harder to test
   - Leads to unpredictable behavior
   - Creates hidden dependencies

2. **Instance State is Better**
   - Makes behavior predictable
   - Easier to test and maintain
   - Clearer dependencies

## Running the Tests

```bash
# Run tests
python -m unittest test.py
```

## Files

- `untestable.py` - Demonstrates the global state anti-pattern
- `testable.py` - Refactors the code to use instance state and dependency injection
- `test.py` - Contains tests for the refactored code
