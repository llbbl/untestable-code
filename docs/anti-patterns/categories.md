# Anti-Pattern Categories and Their Impact on Testability

## 1. State Management Anti-Patterns

### Category Description

Patterns that involve improper management of state, making it difficult to control and verify the state of the system during testing.

### Common Patterns

- Global variables and static state
- Module-level state
- Package-level state
- Singleton abuse
- Mutable default arguments

### Impact on Testability

- Tests cannot run in isolation
- State leaks between tests
- Order-dependent test execution
- Difficult to reset state between tests
- Non-deterministic test behavior

## 2. Dependency Management Anti-Patterns

### Category Description

Patterns that create tight coupling between components, making it difficult to substitute dependencies with test doubles.

### Common Patterns

- Direct instantiation of dependencies
- Service locator pattern
- Concrete type dependencies
- Circular dependencies
- Hard-coded dependencies

### Impact on Testability

- Difficult to mock dependencies
- Complex test setup
- Tests affected by implementation details
- High coupling between components
- Difficult to test components in isolation

## 3. Error Handling Anti-Patterns

### Category Description

Patterns that make it difficult to test error scenarios and verify error handling behavior.

### Common Patterns

- Exception swallowing
- Generic exception handling
- Bare exception catching
- Error state hiding
- Inconsistent error propagation

### Impact on Testability

- Difficult to test error scenarios
- Hidden error conditions
- Incomplete error handling coverage
- Unclear error boundaries
- Difficult to verify error recovery

## 4. Resource Management Anti-Patterns

### Category Description

Patterns that make it difficult to manage and verify resource lifecycle in tests.

### Common Patterns

- Unmanaged resources
- Connection leaks
- File handle leaks
- Missing cleanup
- Improper resource disposal

### Impact on Testability

- Resource cleanup in tests
- Difficult to verify resource management
- Test isolation issues
- Complex setup/teardown
- Resource exhaustion in test suites

## 5. Testing Anti-Patterns

### Category Description

Patterns that make tests themselves difficult to maintain and unreliable.

### Common Patterns

- Testing implementation details
- Uncontrolled side effects
- File system dependencies
- Network dependencies
- Time-dependent tests

### Impact on Testability

- Brittle tests
- False positives/negatives
- Difficult to maintain
- Unreliable test execution
- Tests that test the wrong things

## 6. Concurrency Anti-Patterns

### Category Description

Patterns that make it difficult to test concurrent behavior and verify thread safety.

### Common Patterns

- Race conditions
- Non-thread-safe collections
- Unsafe goroutine usage
- Improper synchronization
- Deadlock-prone code

### Impact on Testability

- Race conditions in tests
- Non-deterministic behavior
- Difficult to reproduce issues
- Complex concurrent testing setup
- Tests that pass by accident

## 7. Framework-Specific Anti-Patterns

### Category Description

Patterns that are specific to particular frameworks and make testing more complex.

### Common Patterns

- Complex initialization in constructors
- Framework-specific state management
- Direct framework API usage
- Framework-specific side effects
- Improper use of framework features

### Impact on Testability

- Framework-specific testing complexity
- Difficult to mock framework components
- Complex setup requirements
- Framework version dependencies
- Testing framework limitations

## 8. Design Pattern Anti-Patterns

### Category Description

Patterns that misuse or overuse design patterns, making code more complex and harder to test.

### Common Patterns

- God object
- Tight coupling
- Interface segregation violation
- Over-abstraction
- Pattern overuse

### Impact on Testability

- Complex object graphs
- Difficult to mock dependencies
- High coupling
- Complex test setup
- Tests that are too complex

## 9. Constructor Anti-Patterns

### Category Description

Patterns that make object creation and initialization difficult to test.

### Common Patterns

- Complex constructors
- Static initialization
- Side effects in constructors
- Hidden dependencies
- Initialization order dependencies

### Impact on Testability

- Difficult to create test instances
- Complex object creation
- Static initialization order issues
- Hidden initialization requirements
- Difficult to verify initialization

## 10. Interface Anti-Patterns

### Category Description

Patterns that make interfaces difficult to implement and test.

### Common Patterns

- Interface segregation violation
- Concrete type dependencies
- Interface bloat
- Leaky abstractions
- Interface misuse

### Impact on Testability

- Difficult to create test implementations
- Complex interface requirements
- Testing irrelevant interface methods
- Interface versioning issues
- Difficult to verify interface contracts
