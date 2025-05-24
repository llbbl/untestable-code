# Tight Coupling Anti-pattern

This example demonstrates the Tight Coupling anti-pattern and how to refactor it into a testable solution.

## Anti-pattern Description

The Tight Coupling anti-pattern occurs when components are directly dependent on specific implementations, making it difficult to:

- Test components in isolation
- Modify or replace components
- Understand component dependencies
- Maintain and evolve the codebase
- Reuse components in different contexts

## Files

- `untestable.py`: Contains the anti-pattern example with tightly coupled components
- `testable.py`: Shows how to refactor the code to make it testable
- `test.py`: Contains comprehensive tests for the refactored code

## Key Concepts

1. **Interface Definition**: Define clear interfaces for dependencies
2. **Dependency Injection**: Pass dependencies to components instead of creating them
3. **Abstraction Layers**: Create abstraction layers between components
4. **Factory Functions**: Use factory functions to create and configure components
5. **Clear Boundaries**: Maintain clear boundaries between components

## Running Tests

To run all tests:

```bash
python -m unittest test.py
```

To run specific test classes:

```bash
python -m unittest test.TestOrderProcessor
python -m unittest test.TestOrderManager
python -m unittest test.TestOrderManagerIntegration
```

## Example Usage

### Untestable Version

```python
class OrderProcessor:
    def __init__(self):
        # Direct instantiation of dependencies
        self.db = Database()
        self.email_sender = EmailSender()

    def process_order(self, order_data):
        # Process order and save to database
        order_id = self.db.save_order(order_data)

        # Send confirmation email
        self.email_sender.send_order_confirmation(
            order_data['customer_email'],
            order_id
        )

        return self.db.get_order(order_id)
```

### Testable Version

```python
class OrderProcessor:
    def __init__(self, repository: OrderRepository, notification_service: NotificationService):
        self.repository = repository
        self.notification_service = notification_service

    def process_order(self, order_data: Dict) -> Dict:
        # Process order and save to repository
        order_id = self.repository.save_order(order_data)

        # Send confirmation notification
        self.notification_service.send_order_confirmation(
            order_data['customer_email'],
            order_id
        )

        return self.repository.get_order(order_id)
```

## Benefits of the Testable Solution

1. **Testability**: Components can be tested in isolation using mocks
2. **Flexibility**: Dependencies can be easily replaced or modified
3. **Maintainability**: Clear separation of concerns and dependencies
4. **Reusability**: Components can be reused in different contexts
5. **Clarity**: Dependencies and their requirements are explicit

## Testing Strategy

1. **Unit Tests**: Test each component in isolation using mock dependencies
2. **Integration Tests**: Test component interactions using real implementations
3. **Mock Dependencies**: Use mock objects to simulate dependencies
4. **Error Conditions**: Test error handling and edge cases
5. **Factory Functions**: Test component creation and configuration
