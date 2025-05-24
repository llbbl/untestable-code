# Complex Logic Anti-pattern in Python

This directory demonstrates the Complex Logic anti-pattern and its testable solution in Python.

## Overview

Complex Logic anti-patterns make code difficult to test by combining multiple responsibilities, using deeply nested conditionals, and hiding business rules within complex algorithms. This makes it challenging to test all possible paths and edge cases.

## Files

- `untestable.py`: Demonstrates the anti-pattern with:

  - Methods with multiple responsibilities
  - Deeply nested conditionals
  - Complex algorithms without clear boundaries
  - Mixed levels of abstraction
  - Unclear business rules
  - Hidden dependencies

- `testable.py`: Shows how to make the code testable by:

  - Breaking down complex methods into single-responsibility methods
  - Extracting business rules into separate classes
  - Separating concerns (order processing, inventory management)
  - Making dependencies explicit and injectable
  - Using pure functions for calculations
  - Creating clear boundaries between components

- `test.py`: Contains tests demonstrating how to test the refactored code:
  - Unit tests for individual components
  - Tests for business rules
  - Tests for edge cases
  - Tests for error conditions

## Key Concepts

### Single Responsibility Methods

Each method should do one thing well, with clear input/output contracts. This makes it easier to test in isolation.

### Clear Business Rules

Business rules should be extracted into separate classes, making them explicit and testable. This allows for easy modification without affecting other code.

### Separated Concerns

Order processing logic should be separated from inventory management. Each component should have a clear purpose with explicit and injectable dependencies.

### Pure Functions

Business calculations should be pure functions, where the same input always produces the same output. This makes it easy to test with different inputs.

### Clear Boundaries

Components should have clear interfaces and explicit dependencies, making them easy to mock for testing.

## Running the Tests

```bash
# Run all tests
python -m unittest test.py

# Run specific test class
python -m unittest test.TestOrderProcessor

# Run specific test method
python -m unittest test.TestOrderProcessor.test_process_order_success
```

## Example Usage

```python
# Untestable version
order_processor = OrderProcessor()
result = order_processor.process_order(order_data)  # Complex, hard to test

# Testable version
discount_calculator = DiscountCalculator()
tax_calculator = TaxCalculator()
shipping_calculator = ShippingCalculator()
order_validator = OrderValidator()

order_processor = OrderProcessor(
    discount_calculator=discount_calculator,
    tax_calculator=tax_calculator,
    shipping_calculator=shipping_calculator,
    order_validator=order_validator
)
result = order_processor.process_order(order_data)  # Easy to test
```
