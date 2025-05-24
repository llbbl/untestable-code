# Non-deterministic Behavior Anti-pattern in Python

This directory demonstrates the Non-deterministic Behavior anti-pattern and its testable solution in Python.

## Overview

Non-deterministic behavior makes code difficult to test because it depends on external factors like time, random numbers, or system state. This leads to flaky tests and unreliable test results.

## Files

- `untestable.py`: Demonstrates the anti-pattern with:

  - Direct time dependencies (business hours check)
  - Random number generation (processing times)
  - External system state checks (inventory, credit, shipping)
  - Uncontrolled side effects (database updates, email sending)
  - Race conditions in batch processing

- `testable.py`: Shows how to make the code testable by:

  - Abstracting time dependencies through dependency injection
  - Controlling random number generation
  - Abstracting external system interactions
  - Controlling side effects
  - Making processing deterministic
  - Creating clear boundaries

- `test.py`: Contains tests demonstrating how to test the refactored code:
  - Tests for time-dependent behavior
  - Tests for random number generation
  - Tests for external system interactions
  - Tests for side effects
  - Tests for error conditions

## Key Concepts

### Time Abstraction

Time-dependent code should use a time provider interface that can be mocked in tests. This allows controlling time in test scenarios.

### Controlled Randomness

Random number generation should be abstracted through a provider interface. This allows using deterministic values in tests.

### External System Abstraction

External system interactions should be abstracted through interfaces. This allows mocking external systems in tests.

### Controlled Side Effects

Side effects should be explicit and controllable. This allows verifying side effects in tests.

### Deterministic Processing

Processing should be deterministic when possible. This makes tests reliable and repeatable.

### Clear Boundaries

Components should have clear interfaces and explicit dependencies. This makes it easy to mock dependencies in tests.

## Running the Tests

```bash
# Run all tests
python -m unittest test.py

# Run specific test class
python -m unittest test.TestOrderProcessor

# Run specific test method
python -m unittest test.TestOrderProcessor.test_process_order_during_business_hours
```

## Example Usage

```python
# Untestable version
order_processor = OrderProcessor()
result = order_processor.process_order(order_data)  # Depends on time, random numbers, external systems

# Testable version
time_provider = MockTimeProvider(datetime(2024, 1, 1, 10, 0))
random_provider = MockRandomProvider([0.5, 1.0, 1.5])
inventory_service = Mock(spec=InventoryService)
credit_service = Mock(spec=CreditService)
shipping_service = Mock(spec=ShippingService)
email_service = Mock(spec=EmailService)

order_processor = OrderProcessor(
    time_provider=time_provider,
    random_provider=random_provider,
    inventory_service=inventory_service,
    credit_service=credit_service,
    shipping_service=shipping_service,
    email_service=email_service
)
result = order_processor.process_order(order_data)  # Easy to test with controlled behavior
```

## Testing Strategies

### Time-dependent Behavior

```python
# Set specific time for test
time_provider.current_time = datetime(2024, 1, 1, 10, 0)  # 10 AM
result = order_processor.process_order(order_data)
assert result.success

# Test outside business hours
time_provider.current_time = datetime(2024, 1, 1, 8, 0)  # 8 AM
result = order_processor.process_order(order_data)
assert not result.success
```

### Random Number Generation

```python
# Use deterministic random values
random_provider = MockRandomProvider([0.5, 1.0, 1.5])
result = order_processor.process_order(order_data)
assert result.processing_time == 0.5
```

### External System Interactions

```python
# Mock external system responses
inventory_service.check_availability.return_value = True
credit_service.check_credit.return_value = True
shipping_service.check_availability.return_value = True
result = order_processor.process_order(order_data)
assert result.success
```

### Side Effects

```python
# Verify side effects
order_processor.process_order(order_data)
inventory_service.update_quantity.assert_called_once()
credit_service.update_credit.assert_called_once()
email_service.send_email.assert_called_once()
```
