# Constructor Side Effects Anti-pattern

This example demonstrates the Constructor Side Effects anti-pattern and how to refactor it to make the code more testable.

## Anti-pattern Description

The Constructor Side Effects anti-pattern occurs when constructors perform complex operations or have side effects, such as:

1. Database connections
2. File system operations
3. Network calls
4. Global state modifications
5. Complex initialization logic

This makes the code difficult to test because:

- Components can't be instantiated without side effects
- Dependencies are hard-coded
- State changes are implicit
- Error handling is difficult
- Testing requires complex setup

## Files

- `untestable.py`: Demonstrates the anti-pattern with side effects in constructors
- `testable.py`: Shows how to refactor the code to avoid constructor side effects
- `test.py`: Contains tests for the refactored code

## Key Concepts

1. **Separate Construction from Initialization**

   - Keep constructors simple
   - Move initialization to explicit methods
   - Allow for lazy initialization

2. **Use Dependency Injection**

   - Pass dependencies to constructors
   - Make dependencies explicit
   - Allow for different implementations

3. **Make Side Effects Explicit**

   - Create clear initialization methods
   - Document side effects
   - Handle errors explicitly

4. **Use Factory Methods**

   - Encapsulate object creation
   - Configure dependencies
   - Handle initialization

5. **Maintain Clear Boundaries**
   - Separate concerns
   - Define clear interfaces
   - Make dependencies explicit

## Running Tests

To run the tests:

```bash
# Run all tests
python -m unittest test.py

# Run specific test class
python -m unittest test.TestDatabaseConnection

# Run specific test method
python -m unittest test.TestDatabaseConnection.test_connect_and_create_tables
```

## Example Usage

### Untestable Version

```python
class UserService:
    def __init__(self):
        # Side effects in constructor
        self.db = DatabaseConnection()  # Connects to database
        self.email_service = EmailService()  # Connects to SMTP
        self._load_config()  # Reads from file system
        self._start_background_tasks()  # Starts threads
```

### Testable Version

```python
class UserService:
    def __init__(self, user_manager: UserManager):
        self.user_manager = user_manager
        self.cache_dir = 'cache'

    def initialize(self):
        # Explicit initialization
        self.user_manager.initialize()
        if not os.path.exists(self.cache_dir):
            os.makedirs(self.cache_dir)

    def cleanup(self):
        # Explicit cleanup
        self.user_manager.cleanup()

# Usage
user_service = create_user_service()
user_service.initialize()
try:
    # Use the service...
finally:
    user_service.cleanup()
```

## Benefits of the Testable Solution

1. **Improved Testability**

   - Components can be tested in isolation
   - Dependencies can be mocked
   - Initialization can be tested separately
   - Error conditions can be tested
   - State changes are explicit

2. **Better Error Handling**

   - Initialization errors are explicit
   - Resources can be cleaned up properly
   - Error conditions are testable
   - State is consistent

3. **More Flexible**

   - Dependencies can be swapped
   - Initialization can be customized
   - Resources can be managed explicitly
   - Configuration is flexible

4. **Clearer Intent**

   - Side effects are explicit
   - Dependencies are clear
   - Initialization is controlled
   - State changes are visible

5. **Easier Maintenance**
   - Components are decoupled
   - Dependencies are explicit
   - State is managed clearly
   - Error handling is consistent
