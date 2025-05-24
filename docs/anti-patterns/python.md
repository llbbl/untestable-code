# Python Untestable Code Anti-Patterns

## 1. Module-Level Code Execution

### Anti-Patterns

- **Module-Level State**

  ```python
  # Bad
  cache = {}  # Module-level state

  def get_data(id):
      if id in cache:
          return cache[id]
      cache[id] = fetch_data(id)
      return cache[id]
  ```

- **Side Effects in Imports**

  ```python
  # Bad
  import requests
  import json

  # Module-level side effects
  config = json.load(open('config.json'))
  session = requests.Session()
  session.headers.update(config['headers'])
  ```

### Testing Challenges

- Tests can't run in isolation
- State persists between tests
- Import-time side effects
- Difficult to mock module-level dependencies

## 2. Global State and Mutable Defaults

### Anti-Patterns

- **Mutable Default Arguments**

  ```python
  # Bad
  def process_items(items=[]):  # Mutable default
      items.append('processed')
      return items
  ```

- **Global Variables**

  ```python
  # Bad
  DATABASE = None

  def init_db():
      global DATABASE
      DATABASE = connect_to_db()

  def query_db(query):
      return DATABASE.execute(query)  # Global dependency
  ```

### Testing Challenges

- State leaks between function calls
- Difficult to reset state between tests
- Order-dependent test execution
- Global state affects test isolation

## 3. Class Design Anti-Patterns

### Anti-Patterns

- **Tight Coupling**

  ```python
  # Bad
  class UserService:
      def __init__(self):
          self.db = Database()  # Direct instantiation
          self.cache = Cache()
          self.logger = Logger()

      def get_user(self, user_id):
          return self.db.query(f"SELECT * FROM users WHERE id = {user_id}")
  ```

- **Private Method Testing**

  ```python
  # Bad
  class DataProcessor:
      def __init__(self):
          self._internal_state = {}

      def _process_data(self, data):  # Complex private method
          # Complex processing logic
          pass

      def process(self, data):
          return self._process_data(data)
  ```

### Testing Challenges

- Difficult to mock dependencies
- Complex setup for isolated testing
- Private method testing complexity
- State management issues

## 4. Exception Handling Anti-Patterns

### Anti-Patterns

- **Bare Exception Handling**

  ```python
  # Bad
  def process_data(data):
      try:
          return complex_operation(data)
      except:  # Bare except
          return None
  ```

- **Exception Swallowing**
  ```python
  # Bad
  def safe_operation():
      try:
          risky_operation()
      except Exception as e:
          print(f"Error occurred: {e}")  # Swallowing exception
  ```

### Testing Challenges

- Difficult to test error scenarios
- Hidden error conditions
- Incomplete error handling coverage
- Unclear error boundaries

## 5. Resource Management Anti-Patterns

### Anti-Patterns

- **Resource Leaks**

  ```python
  # Bad
  def process_file(filename):
      file = open(filename)  # No context manager
      data = file.read()
      # File might not be closed if an exception occurs
      return process_data(data)
  ```

- **Unmanaged Database Connections**
  ```python
  # Bad
  def query_database():
      conn = create_connection()
      cursor = conn.cursor()
      result = cursor.execute("SELECT * FROM data")
      # Connection might not be closed
      return result
  ```

### Testing Challenges

- Resource cleanup in tests
- Difficult to verify resource management
- Test isolation issues
- Complex setup/teardown

## 6. Testing Anti-Patterns

### Anti-Patterns

- **Test Implementation Details**

  ```python
  # Bad
  def test_process_data():
      processor = DataProcessor()
      processor._internal_state = {'count': 0}  # Testing private state
      processor.process('data')
      assert processor._internal_state['count'] == 1
  ```

- **Uncontrolled Side Effects**
  ```python
  # Bad
  def test_file_operation():
      process_file('test.txt')  # Modifies actual file system
      assert os.path.exists('test.txt')
  ```

### Testing Challenges

- Brittle tests
- File system dependencies
- Difficult to maintain
- Unreliable test execution

## 7. Concurrency Anti-Patterns

### Anti-Patterns

- **Global Interpreter Lock (GIL) Issues**

  ```python
  # Bad
  import threading

  shared_counter = 0

  def increment():
      global shared_counter
      for _ in range(1000000):
          shared_counter += 1  # Race condition
  ```

- **Thread Safety Issues**

  ```python
  # Bad
  class Cache:
      def __init__(self):
          self._data = {}

      def set(self, key, value):
          self._data[key] = value  # Not thread-safe

      def get(self, key):
          return self._data.get(key)
  ```

### Testing Challenges

- Race conditions in tests
- Non-deterministic behavior
- Difficult to reproduce issues
- Complex concurrent testing setup

## 8. Framework-Specific Anti-Patterns

### Anti-Patterns

- **Django Model Anti-Patterns**

  ```python
  # Bad
  class User(models.Model):
      def save(self, *args, **kwargs):
          # Complex business logic in save method
          self.process_data()
          self.notify_system()
          super().save(*args, **kwargs)
  ```

- **Flask Route Anti-Patterns**
  ```python
  # Bad
  @app.route('/process')
  def process():
      # Complex business logic in route
      data = request.get_json()
      result = complex_processing(data)
      return jsonify(result)
  ```

### Testing Challenges

- Framework-specific testing complexity
- Database state management
- Request/response cycle testing
- Middleware and context testing
