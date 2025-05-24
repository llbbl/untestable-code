# Untestable Code Examples

This repository contains examples of common untestable code patterns and their testable alternatives across multiple programming languages. The goal is to help developers recognize and avoid these patterns in their own code.

## Overview

Untestable code refers to code that is difficult or impossible to effectively test using standard testing practices. This repository demonstrates various anti-patterns that make code untestable and shows how to refactor them into more testable code.

## Anti-patterns Covered

1. **Hard-coded Dependencies**

   - Direct instantiation of dependencies within classes
   - No way to inject mock objects or test doubles
   - Makes unit testing impossible without modifying the code

2. **Global State**

   - Shared mutable state across multiple components
   - Static variables and singletons that maintain state
   - Makes tests non-deterministic and dependent on execution order

3. **Hidden Side Effects**

   - Methods that modify state without clear indication
   - Unexpected interactions with external systems
   - Makes it difficult to verify behavior in isolation

4. **Complex Logic**

   - Methods with multiple responsibilities
   - Deeply nested conditionals
   - Complex algorithms without clear boundaries
   - Makes it difficult to test all possible paths

5. **Non-deterministic Behavior**

   - Code that depends on time, random numbers, or external state
   - Network calls or file system operations
   - Makes tests flaky and unreliable

6. **Private Method Complexity**

   - Complex logic hidden in private methods
   - No way to test edge cases or error conditions
   - Forces testing through public interfaces only

7. **Tight Coupling**

   - Classes that are highly dependent on each other
   - No clear separation of concerns
   - Makes it difficult to test components in isolation

8. **Constructor Side Effects**
   - Constructors that perform complex initialization
   - Object creation that triggers external system interactions
   - Makes it difficult to create test instances

## Project Structure

```
examples/
├── javascript/
│   ├── hard-coded-dependencies-anti-patterns/
│   ├── global-state-anti-patterns/
│   ├── hidden-side-effects-anti-patterns/
│   ├── complex-logic-anti-patterns/
│   ├── non-deterministic-anti-patterns/
│   ├── private-method-complexity-anti-patterns/
│   ├── tight-coupling-anti-patterns/
│   └── constructor-side-effects-anti-patterns/
├── python/
│   ├── hard-coded-dependencies-anti-patterns/
│   ├── global-state-anti-patterns/
│   └── ...
├── java/
│   ├── hard-coded-dependencies-anti-patterns/
│   ├── global-state-anti-patterns/
│   └── ...
├── csharp/
│   ├── hard-coded-dependencies-anti-patterns/
│   ├── global-state-anti-patterns/
│   └── ...
└── go/
    ├── hard-coded-dependencies-anti-patterns/
    ├── global-state-anti-patterns/
    └── ...
```

Each anti-pattern directory contains:

- `untestable.{ext}`: Example of untestable code
- `testable.{ext}`: Refactored version that is testable
- `test.{ext}`: Tests demonstrating how to test the refactored code

## How to Use

1. Browse the examples by language and anti-pattern
2. Study the untestable code to understand why it's difficult to test
3. Compare it with the testable version to see how it was refactored
4. Review the tests to understand how to test the refactored code


