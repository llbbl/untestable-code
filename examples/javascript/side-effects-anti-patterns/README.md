# Side Effects Anti-Patterns in JavaScript/TypeScript

This example demonstrates common side effects anti-patterns that make code difficult to test and maintain, along with their solutions.

## Problems

### 1. Hidden Side Effects

- Side effects are not clearly documented or visible
- Functions modify state without making it obvious
- Changes to global state are implicit
- Makes it difficult to understand what a function does
- Hard to test because side effects are not obvious

### 2. Global State Mutation

- Functions modify global state directly
- State changes are not isolated
- Side effects can affect other parts of the application
- Makes testing difficult due to shared state
- Can lead to race conditions and bugs

### 3. Impure Functions

- Functions have side effects and return values
- Same input can produce different outputs
- Depends on external state
- Hard to test because behavior is not predictable
- Makes code harder to reason about

### 4. Uncontrolled Side Effects

- Side effects are not properly managed
- No clear boundaries for side effects
- Side effects can propagate unexpectedly
- Makes it difficult to test in isolation
- Can lead to unexpected behavior

### 5. Mixed Responsibilities

- Functions handle both business logic and side effects
- Single function does too many things
- Hard to test because of multiple concerns
- Makes code harder to maintain
- Violates single responsibility principle

### 6. Temporal Coupling

- Operations must be performed in a specific order
- Side effects depend on previous operations
- Makes testing difficult because of dependencies
- Can lead to race conditions
- Hard to parallelize operations

## Solutions

### 1. Explicit Side Effects

- Document all side effects clearly
- Make side effects visible in the code
- Use clear naming conventions
- Separate side effects from business logic
- Make testing easier by being explicit

### 2. Pure Functions

- Functions should be pure when possible
- Same input always produces same output
- No side effects
- Easy to test
- Easy to reason about

### 3. Controlled Side Effects

- Manage side effects properly
- Use dependency injection
- Isolate side effects
- Make testing easier
- Prevent unexpected behavior

### 4. Single Responsibility

- Each function should do one thing
- Separate business logic from side effects
- Make testing easier
- Make code more maintainable
- Follow single responsibility principle

### 5. Dependency Injection

- Inject dependencies instead of creating them
- Make testing easier by allowing mocks
- Make side effects explicit
- Make code more maintainable
- Follow dependency inversion principle

### 6. Immutable State

- Use immutable data structures
- Return new instances instead of modifying existing ones
- Make state changes explicit
- Make testing easier
- Prevent unexpected state changes

## Testing Strategies

1. **Mock Side Effects**

   - Use mocks for external dependencies
   - Verify side effects are called correctly
   - Test error cases
   - Test success cases
   - Test edge cases

2. **Test Pure Functions**

   - Test with different inputs
   - Verify output is correct
   - Test edge cases
   - Test error cases
   - No need to mock dependencies

3. **Verify Side Effects**

   - Check that side effects are called
   - Verify correct parameters
   - Test error handling
   - Test success cases
   - Test edge cases

4. **Test Immutable State**
   - Verify new instances are created
   - Check old instances are not modified
   - Test state transitions
   - Test error cases
   - Test edge cases

## Key Lessons

1. **Design for Testing**

   - Make side effects explicit
   - Use dependency injection
   - Keep functions pure when possible
   - Follow single responsibility principle
   - Use immutable data structures

2. **Clear Boundaries**

   - Separate business logic from side effects
   - Use clear interfaces
   - Document side effects
   - Make testing easier
   - Make code more maintainable

3. **Proper Error Handling**

   - Handle errors properly
   - Log errors appropriately
   - Clean up resources
   - Test error cases
   - Make error handling explicit

4. **Maintainable Code**
   - Write clear, documented code
   - Use proper abstractions
   - Follow SOLID principles
   - Make testing easier
   - Make code more maintainable

## Running the Tests

```bash
npm test
```

This will run the test suite and show you how to properly test code with side effects.
