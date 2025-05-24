# Non-deterministic Behavior Anti-Patterns

This example demonstrates common non-deterministic behavior anti-patterns in JavaScript and how to refactor them for better testability and maintainability.

## Anti-Patterns

1. **Direct Time Dependencies**

   - Using real system time
   - Time-based business logic
   - Time-sensitive operations

2. **Random Number Generation**

   - Uncontrolled random values
   - Non-deterministic algorithms
   - Random timing

3. **External System State**

   - Direct external service calls
   - Uncontrolled dependencies
   - System state dependencies

4. **Global Mutable State**

   - Shared mutable state
   - State mutations
   - State leaks

5. **Race Conditions**

   - Uncontrolled concurrency
   - Shared resource access
   - Timing-dependent behavior

6. **Uncontrolled Side Effects**
   - Hidden state changes
   - Unpredictable behavior
   - Resource leaks

## Solutions

1. **Time Abstraction**

   - Abstract time operations
   - Controlled time progression
   - Time-based testing

2. **Controlled Random Number Generation**

   - Seeded random generators
   - Deterministic algorithms
   - Controlled randomness

3. **External System Abstraction**

   - Dependency injection
   - Service interfaces
   - Mock implementations

4. **Immutable State**

   - State encapsulation
   - Immutable data structures
   - State transitions

5. **Controlled Concurrency**

   - Concurrency limits
   - Resource management
   - Synchronization

6. **Controlled Side Effects**
   - Explicit side effects
   - Resource management
   - Effect tracking

## Testing Strategies

1. **Testing Time-dependent Code**

   - Mock time providers
   - Time-based assertions
   - Time progression testing

2. **Testing Random Number Generation**

   - Seeded random generators
   - Deterministic tests
   - Randomness verification

3. **Testing External System Interactions**

   - Mock services
   - Interface testing
   - Integration testing

4. **Testing State Management**

   - State transitions
   - State verification
   - State isolation

5. **Testing Concurrency**

   - Concurrency limits
   - Race condition testing
   - Resource management

6. **Testing Side Effects**
   - Effect verification
   - Resource cleanup
   - Effect isolation

## Key Lessons

1. **Time Management**

   - Abstract time operations
   - Control time progression
   - Test time-dependent code

2. **Randomness Control**

   - Use seeded generators
   - Make randomness deterministic
   - Test random behavior

3. **External Dependencies**

   - Abstract external systems
   - Use dependency injection
   - Mock external services

4. **State Management**

   - Encapsulate state
   - Use immutable data
   - Control state transitions

5. **Concurrency Control**

   - Limit concurrency
   - Manage resources
   - Test race conditions

6. **Side Effect Management**
   - Make effects explicit
   - Track side effects
   - Test effect handling

## Running the Tests

```bash
# Install dependencies
npm install

# Run tests
npm test
```

## Files

- `untestable.js` - Demonstrates common non-deterministic behavior anti-patterns
- `testable.js` - Shows how to refactor the code for better handling of non-deterministic behavior
- `test.js` - Contains tests for the refactored code

</rewritten_file>
