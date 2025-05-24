# Complex Logic Anti-Patterns

This example demonstrates common complex logic anti-patterns in JavaScript/TypeScript and how to refactor them for better testability and maintainability.

## Anti-Patterns

### 1. Methods with Multiple Responsibilities

- **Problem**: Methods that do too many things, making them hard to test and maintain
- **Solution**: Break down complex methods into smaller, single-responsibility methods
- **Example**: `processOrder` method handling validation, payment, inventory, notifications, and error handling

### 2. Deeply Nested Conditionals

- **Problem**: Complex nested if statements that are hard to follow and test
- **Solution**: Extract conditions into separate functions and use early returns
- **Example**: Multiple nested if statements for order validation and processing

### 3. Complex Algorithms without Clear Boundaries

- **Problem**: Business logic mixed with implementation details
- **Solution**: Separate business rules into pure functions with clear inputs and outputs
- **Example**: Order status calculation mixed with payment and inventory logic

### 4. Mixed Levels of Abstraction

- **Problem**: High-level business logic mixed with low-level implementation details
- **Solution**: Separate concerns into different layers of abstraction
- **Example**: Database operations mixed with business rules

### 5. Unclear Business Rules

- **Problem**: Business rules scattered throughout the code
- **Solution**: Extract business rules into dedicated functions with clear names
- **Example**: Order status rules mixed with payment and inventory logic

### 6. Hidden Dependencies

- **Problem**: Dependencies not clearly declared or injected
- **Solution**: Use dependency injection and make dependencies explicit
- **Example**: Directly requiring dependencies in the constructor

## Solutions

### 1. Single Responsibility Methods

- Break down complex methods into smaller, focused methods
- Each method should do one thing and do it well
- Makes testing easier and code more maintainable

### 2. Clear Business Rules

- Extract business rules into pure functions
- Make rules explicit and easy to understand
- Separate rules from implementation details

### 3. Separated Concerns

- Keep different levels of abstraction separate
- Business logic should be independent of implementation details
- Use interfaces to define clear boundaries

### 4. Explicit Dependencies

- Use dependency injection
- Make dependencies clear in the constructor
- Easier to mock and test

### 5. Pure Functions

- Extract pure functions for business logic
- No side effects
- Easy to test and reason about

### 6. Clear Boundaries

- Define clear interfaces between components
- Use factory functions for object creation
- Make dependencies and responsibilities explicit

## Testing Strategies

### 1. Testing Pure Functions

- Test business rules in isolation
- No need for mocks or setup
- Easy to test edge cases

### 2. Testing Single Responsibility Methods

- Test each method independently
- Focus on one behavior at a time
- Clear test cases

### 3. Testing Business Rules

- Test business rules separately from implementation
- Verify rules are correctly applied
- Test edge cases and error conditions

### 4. Testing Error Handling

- Test error cases explicitly
- Verify error messages and recovery
- Test error propagation

### 5. Testing Dependencies

- Mock dependencies for isolated testing
- Verify correct interaction with dependencies
- Test error handling with dependencies

### 6. Testing Boundaries

- Test component interfaces
- Verify correct data flow
- Test error handling at boundaries

## Key Lessons

1. **Keep Methods Focused**

   - One responsibility per method
   - Easy to understand and test
   - Clear purpose

2. **Extract Business Rules**

   - Make rules explicit
   - Separate from implementation
   - Easy to modify and test

3. **Use Dependency Injection**

   - Make dependencies explicit
   - Easy to mock for testing
   - Clear component boundaries

4. **Write Pure Functions**

   - No side effects
   - Easy to test
   - Predictable behavior

5. **Define Clear Interfaces**
   - Clear component boundaries
   - Explicit dependencies
   - Easy to test and maintain

## Running the Tests

```bash
npm install
npm test
```

The tests demonstrate:

- Testing pure functions
- Testing single responsibility methods
- Testing business rules
- Testing error handling
- Testing dependencies
- Testing boundaries
