# Dependency Management Anti-Patterns Example

This example demonstrates common dependency management anti-patterns that make testing difficult, and how to refactor them into testable code.

## The Problem

The `untestable.js` file demonstrates several anti-patterns that make code difficult to test:

1. **Direct Instantiation**

   - Dependencies are created inside classes
   - No way to inject mock objects
   - Hard to test in isolation
   - Difficult to control behavior

2. **Hard-coded Dependencies**

   - Configuration is hard-coded
   - External services are directly required
   - No way to change behavior
   - Difficult to test different scenarios

3. **Circular Dependencies**

   - Services depend on each other
   - Complex initialization order
   - Hard to test in isolation
   - Difficult to mock dependencies

4. **Implicit Dependencies**

   - Dependencies are not clearly defined
   - Hidden service locator usage
   - Unclear what needs to be mocked
   - Hard to understand requirements

5. **Service Locator Pattern**

   - Global service registry
   - Hidden dependencies
   - Difficult to track usage
   - Hard to mock services

6. **Static Dependencies**
   - Static configuration
   - Static service instances
   - No way to change behavior
   - Difficult to test different scenarios

## The Solution

The `testable.js` file shows how to refactor the code to be more testable:

1. **Dependency Injection**

   - Dependencies are injected through constructors
   - Easy to provide mock implementations
   - Clear dependency requirements
   - Easy to test in isolation

2. **Interface-based Design**

   - Dependencies are defined by interfaces
   - Easy to create mock implementations
   - Clear contracts
   - Easy to verify behavior

3. **Configuration Injection**

   - Configuration is injected
   - Easy to provide test configuration
   - No hard-coded values
   - Easy to test different scenarios

4. **Clear Boundaries**

   - Explicit dependencies
   - Clear responsibilities
   - No circular dependencies
   - Easy to test components

5. **Factory Functions**

   - Dependencies are created by factories
   - Easy to provide test implementations
   - Clear initialization order
   - Easy to test different configurations

6. **No Static Dependencies**
   - No global state
   - No static instances
   - Everything is injectable
   - Easy to control behavior

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
   - Configuration scenarios
   - Service interactions

3. **Benefits**
   - Reliable tests
   - Clear test boundaries
   - Easy to maintain
   - Good coverage

## Key Lessons

1. **Use Dependency Injection**

   - Inject all dependencies
   - Define clear interfaces
   - Make dependencies explicit
   - Easy to test

2. **Avoid Anti-patterns**

   - No direct instantiation
   - No hard-coded dependencies
   - No circular dependencies
   - No service locators

3. **Design for Testing**
   - Consider testability
   - Make dependencies injectable
   - Keep boundaries clear
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
