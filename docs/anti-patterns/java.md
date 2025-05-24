# Java Untestable Code Anti-Patterns

## 1. Static State and Singletons

### Anti-Patterns

- **Static Utility Classes**

  ```java
  // Bad
  public class DatabaseUtils {
      private static Connection connection;

      public static void initialize() {
          connection = DriverManager.getConnection("jdbc:mysql://localhost:3306/db");
      }

      public static ResultSet query(String sql) {
          return connection.createStatement().executeQuery(sql);
      }
  }
  ```

- **Singleton Pattern Abuse**

  ```java
  // Bad
  public class Configuration {
      private static Configuration instance;
      private Map<String, String> settings;

      private Configuration() {
          settings = loadSettings();
      }

      public static Configuration getInstance() {
          if (instance == null) {
              instance = new Configuration();
          }
          return instance;
      }
  }
  ```

### Testing Challenges

- Global state affects test isolation
- Difficult to mock static methods
- Order-dependent test execution
- State leaks between tests

## 2. Constructor Anti-Patterns

### Anti-Patterns

- **Complex Constructors**

  ```java
  // Bad
  public class UserService {
      private final Database database;
      private final Cache cache;
      private final Logger logger;

      public UserService() {
          this.database = new Database();  // Direct instantiation
          this.cache = new Cache();
          this.logger = new Logger();
          this.database.connect();
          this.cache.initialize();
      }
  }
  ```

- **Static Initialization**

  ```java
  // Bad
  public class DataProcessor {
      private static final Map<String, Processor> processors;

      static {
          processors = new HashMap<>();
          processors.put("type1", new Type1Processor());
          processors.put("type2", new Type2Processor());
      }
  }
  ```

### Testing Challenges

- Difficult to inject dependencies
- Complex object creation
- Static initialization order issues
- Hard to mock dependencies

## 3. Exception Handling Anti-Patterns

### Anti-Patterns

- **Exception Swallowing**

  ```java
  // Bad
  public void processData() {
      try {
          riskyOperation();
      } catch (Exception e) {
          logger.error("Error occurred");  // Swallowing exception
      }
  }
  ```

- **Generic Exception Handling**
  ```java
  // Bad
  public void handleRequest() {
      try {
          processRequest();
      } catch (Exception e) {  // Too generic
          handleError(e);
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

  ```java
  // Bad
  public class FileProcessor {
      public void processFile(String filename) {
          FileInputStream fis = new FileInputStream(filename);
          // No try-with-resources
          byte[] data = new byte[fis.available()];
          fis.read(data);
          // Resource might not be closed
      }
  }
  ```

- **Connection Leaks**
  ```java
  // Bad
  public class DatabaseService {
      public ResultSet query(String sql) {
          Connection conn = getConnection();
          Statement stmt = conn.createStatement();
          return stmt.executeQuery(sql);
          // Connection and Statement not closed
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

  ```java
  // Bad
  @Test
  public void testProcessData() {
      DataProcessor processor = new DataProcessor();
      processor.setInternalState(new HashMap<>());  // Testing private state
      processor.process("data");
      assertEquals(1, processor.getInternalState().size());
  }
  ```

- **Uncontrolled Side Effects**
  ```java
  // Bad
  @Test
  public void testFileOperation() {
      FileProcessor processor = new FileProcessor();
      processor.processFile("test.txt");  // Modifies actual file system
      assertTrue(new File("test.txt").exists());
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

  ```java
  // Bad
  public class Cache {
      private Map<String, Object> data = new HashMap<>();  // Not thread-safe

      public void put(String key, Object value) {
          data.put(key, value);
      }
  }
  ```

- **Race Conditions**

  ```java
  // Bad
  public class Counter {
      private int count = 0;

      public void increment() {
          count++;  // Not atomic
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

- **Spring Bean Anti-Patterns**

  ```java
  // Bad
  @Service
  public class UserService {
      @Autowired
      private UserRepository userRepository;  // Field injection

      @PostConstruct
      public void init() {
          // Complex initialization logic
      }
  }
  ```

- **JPA Entity Anti-Patterns**

  ```java
  // Bad
  @Entity
  public class User {
      @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
      private List<Order> orders;

      public void addOrder(Order order) {
          // Complex business logic in entity
          processOrder(order);
          orders.add(order);
      }
  }
  ```

### Testing Challenges

- Framework-specific testing complexity
- Database state management
- Transaction management
- Context and dependency injection testing

## 8. Design Pattern Anti-Patterns

### Anti-Patterns

- **Service Locator**

  ```java
  // Bad
  public class ServiceLocator {
      private static Map<String, Object> services = new HashMap<>();

      public static void register(String name, Object service) {
          services.put(name, service);
      }

      public static Object getService(String name) {
          return services.get(name);
      }
  }
  ```

- **God Object**
  ```java
  // Bad
  public class UserManager {
      public void createUser() { /* ... */ }
      public void updateUser() { /* ... */ }
      public void deleteUser() { /* ... */ }
      public void processPayment() { /* ... */ }
      public void sendNotification() { /* ... */ }
      public void generateReport() { /* ... */ }
  }
  ```

### Testing Challenges

- Complex object graphs
- Difficult to mock dependencies
- High coupling
- Complex test setup
