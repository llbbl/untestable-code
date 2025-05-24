# C# Untestable Code Anti-Patterns

## 1. Static State and Singletons

### Anti-Patterns

- **Static Classes and Methods**

  ```csharp
  // Bad
  public static class DatabaseHelper
  {
      private static SqlConnection _connection;

      public static void Initialize()
      {
          _connection = new SqlConnection("connection_string");
          _connection.Open();
      }

      public static DataTable ExecuteQuery(string sql)
      {
          using (var command = _connection.CreateCommand())
          {
              command.CommandText = sql;
              return command.ExecuteReader().ToDataTable();
          }
      }
  }
  ```

- **Singleton Pattern Abuse**
  ```csharp
  // Bad
  public class Configuration
  {
      private static Configuration _instance;
      private readonly Dictionary<string, string> _settings;

      private Configuration()
      {
          _settings = LoadSettings();
      }

      public static Configuration Instance
      {
          get
          {
              if (_instance == null)
              {
                  _instance = new Configuration();
              }
              return _instance;
          }
      }
  }
  ```

### Testing Challenges

- Global state affects test isolation
- Difficult to mock static methods
- Order-dependent test execution
- State leaks between tests

## 2. Dependency Injection Anti-Patterns

### Anti-Patterns

- **Service Locator**

  ```csharp
  // Bad
  public class UserService
  {
      private readonly IUserRepository _userRepository;

      public UserService()
      {
          _userRepository = ServiceLocator.Resolve<IUserRepository>();
      }
  }
  ```

- **Concrete Dependencies**
  ```csharp
  // Bad
  public class OrderProcessor
  {
      private readonly SqlDatabase _database;
      private readonly FileLogger _logger;

      public OrderProcessor()
      {
          _database = new SqlDatabase();
          _logger = new FileLogger();
      }
  }
  ```

### Testing Challenges

- Difficult to mock dependencies
- Tight coupling to implementations
- Complex test setup
- Hard to verify behavior

## 3. Exception Handling Anti-Patterns

### Anti-Patterns

- **Exception Swallowing**

  ```csharp
  // Bad
  public void ProcessData()
  {
      try
      {
          RiskyOperation();
      }
      catch (Exception ex)
      {
          _logger.LogError("Error occurred");  // Swallowing exception
      }
  }
  ```

- **Generic Exception Handling**
  ```csharp
  // Bad
  public void HandleRequest()
  {
      try
      {
          ProcessRequest();
      }
      catch (Exception ex)  // Too generic
      {
          HandleError(ex);
      }
  }
  ```

### Testing Challenges

- Difficult to test error scenarios
- Hidden error conditions
- Incomplete error handling coverage
- Unclear error boundaries

## 4. Resource Management Anti-Patterns

### Anti-Patterns

- **Unmanaged Resources**

  ```csharp
  // Bad
  public class FileProcessor
  {
      public void ProcessFile(string filename)
      {
          var file = File.Open(filename, FileMode.Open);
          // No using statement
          var data = new byte[file.Length];
          file.Read(data, 0, (int)file.Length);
          // File might not be closed
      }
  }
  ```

- **Connection Leaks**
  ```csharp
  // Bad
  public class DatabaseService
  {
      public DataTable ExecuteQuery(string sql)
      {
          var connection = new SqlConnection(_connectionString);
          var command = connection.CreateCommand();
          command.CommandText = sql;
          return command.ExecuteReader().ToDataTable();
          // Connection and command not disposed
      }
  }
  ```

### Testing Challenges

- Resource cleanup in tests
- Difficult to verify resource management
- Test isolation issues
- Complex setup/teardown

## 5. Testing Anti-Patterns

### Anti-Patterns

- **Test Implementation Details**

  ```csharp
  // Bad
  [Test]
  public void TestProcessData()
  {
      var processor = new DataProcessor();
      processor.SetInternalState(new Dictionary<string, object>());  // Testing private state
      processor.Process("data");
      Assert.That(processor.GetInternalState().Count, Is.EqualTo(1));
  }
  ```

- **Uncontrolled Side Effects**
  ```csharp
  // Bad
  [Test]
  public void TestFileOperation()
  {
      var processor = new FileProcessor();
      processor.ProcessFile("test.txt");  // Modifies actual file system
      Assert.That(File.Exists("test.txt"), Is.True);
  }
  ```

### Testing Challenges

- Brittle tests
- File system dependencies
- Difficult to maintain
- Unreliable test execution

## 6. Concurrency Anti-Patterns

### Anti-Patterns

- **Non-Thread-Safe Collections**

  ```csharp
  // Bad
  public class Cache
  {
      private Dictionary<string, object> _data = new Dictionary<string, object>();  // Not thread-safe

      public void Put(string key, object value)
      {
          _data[key] = value;
      }
  }
  ```

- **Race Conditions**
  ```csharp
  // Bad
  public class Counter
  {
      private int _count = 0;

      public void Increment()
      {
          _count++;  // Not atomic
      }
  }
  ```

### Testing Challenges

- Race conditions in tests
- Non-deterministic behavior
- Difficult to reproduce issues
- Complex concurrent testing setup

## 7. Framework-Specific Anti-Patterns

### Anti-Patterns

- **ASP.NET Controller Anti-Patterns**

  ```csharp
  // Bad
  public class UserController : Controller
  {
      private readonly UserService _userService;

      public UserController()
      {
          _userService = new UserService();  // Direct instantiation
      }

      public IActionResult ProcessUser(int id)
      {
          // Complex business logic in controller
          var result = _userService.ProcessUser(id);
          return View(result);
      }
  }
  ```

- **Entity Framework Anti-Patterns**
  ```csharp
  // Bad
  public class User
  {
      public int Id { get; set; }
      public string Name { get; set; }
      public List<Order> Orders { get; set; }

      public void AddOrder(Order order)
      {
          // Complex business logic in entity
          ProcessOrder(order);
          Orders.Add(order);
      }
  }
  ```

### Testing Challenges

- Framework-specific testing complexity
- Database state management
- Request/response cycle testing
- Context and dependency injection testing

## 8. Design Pattern Anti-Patterns

### Anti-Patterns

- **God Object**

  ```csharp
  // Bad
  public class UserManager
  {
      public void CreateUser() { /* ... */ }
      public void UpdateUser() { /* ... */ }
      public void DeleteUser() { /* ... */ }
      public void ProcessPayment() { /* ... */ }
      public void SendNotification() { /* ... */ }
      public void GenerateReport() { /* ... */ }
  }
  ```

- **Tight Coupling**
  ```csharp
  // Bad
  public class OrderProcessor
  {
      private readonly SqlDatabase _database;
      private readonly FileLogger _logger;
      private readonly EmailService _emailService;

      public OrderProcessor()
      {
          _database = new SqlDatabase();
          _logger = new FileLogger();
          _emailService = new EmailService();
      }
  }
  ```

### Testing Challenges

- Complex object graphs
- Difficult to mock dependencies
- High coupling
- Complex test setup
