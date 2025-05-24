# Go Untestable Code Anti-Patterns

## 1. Package-Level State

### Anti-Patterns

- **Global Variables**

  ```go
  // Bad
  package database

  var (
      db     *sql.DB
      config *Config
  )

  func Init() error {
      var err error
      db, err = sql.Open("postgres", "connection_string")
      if err != nil {
          return err
      }
      config = loadConfig()
      return nil
  }

  func Query(query string) (*sql.Rows, error) {
      return db.Query(query)
  }
  ```

- **Package-Level Functions**

  ```go
  // Bad
  package utils

  var cache = make(map[string]interface{})

  func GetCached(key string) (interface{}, bool) {
      return cache[key], true
  }

  func SetCached(key string, value interface{}) {
      cache[key] = value
  }
  ```

### Testing Challenges

- Global state affects test isolation
- Difficult to mock package-level functions
- Order-dependent test execution
- State leaks between tests

## 2. Interface Anti-Patterns

### Anti-Patterns

- **Interface Segregation Violation**

  ```go
  // Bad
  type DataProcessor interface {
      Process(data []byte) error
      Validate(data []byte) error
      Transform(data []byte) ([]byte, error)
      Store(data []byte) error
      Notify(data []byte) error
  }
  ```

- **Concrete Type Dependencies**

  ```go
  // Bad
  type UserService struct {
      db *sql.DB  // Concrete type instead of interface
  }

  func NewUserService() *UserService {
      return &UserService{
          db: connectToDB(),
      }
  }
  ```

### Testing Challenges

- Difficult to mock dependencies
- Tight coupling to implementations
- Complex test setup
- Hard to verify behavior

## 3. Error Handling Anti-Patterns

### Anti-Patterns

- **Error Swallowing**

  ```go
  // Bad
  func ProcessData(data []byte) {
      if err := riskyOperation(data); err != nil {
          log.Printf("Error occurred: %v", err)  // Swallowing error
          return
      }
  }
  ```

- **Generic Error Handling**
  ```go
  // Bad
  func HandleRequest(req *Request) error {
      if err := processRequest(req); err != nil {
          return fmt.Errorf("failed to process request: %v", err)  // Generic error
      }
      return nil
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

  ```go
  // Bad
  func ProcessFile(filename string) error {
      file, err := os.Open(filename)
      if err != nil {
          return err
      }
      // No defer file.Close()
      data := make([]byte, 1024)
      _, err = file.Read(data)
      return err
  }
  ```

- **Connection Leaks**
  ```go
  // Bad
  func QueryDatabase(query string) (*sql.Rows, error) {
      db, err := sql.Open("postgres", "connection_string")
      if err != nil {
          return nil, err
      }
      // No defer db.Close()
      return db.Query(query)
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

  ```go
  // Bad
  func TestProcessData(t *testing.T) {
      processor := &DataProcessor{
          internalState: make(map[string]interface{}),
      }
      processor.Process("data")
      if len(processor.internalState) != 1 {
          t.Error("Expected internal state to be updated")
      }
  }
  ```

- **Uncontrolled Side Effects**
  ```go
  // Bad
  func TestFileOperation(t *testing.T) {
      processor := &FileProcessor{}
      processor.ProcessFile("test.txt")  // Modifies actual file system
      if _, err := os.Stat("test.txt"); os.IsNotExist(err) {
          t.Error("Expected file to exist")
      }
  }
  ```

### Testing Challenges

- Brittle tests
- File system dependencies
- Difficult to maintain
- Unreliable test execution

## 6. Concurrency Anti-Patterns

### Anti-Patterns

- **Race Conditions**

  ```go
  // Bad
  type Counter struct {
      count int
  }

  func (c *Counter) Increment() {
      c.count++  // Not atomic
  }
  ```

- **Unsafe Goroutine Usage**
  ```go
  // Bad
  func ProcessItems(items []Item) {
      for _, item := range items {
          go processItem(item)  // No synchronization
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

- **HTTP Handler Anti-Patterns**

  ```go
  // Bad
  func HandleRequest(w http.ResponseWriter, r *http.Request) {
      db := connectToDB()  // Direct instantiation
      defer db.Close()

      // Complex business logic in handler
      data := processData(r)
      storeData(db, data)
      sendNotification(data)

      w.WriteHeader(http.StatusOK)
  }
  ```

- **Middleware Anti-Patterns**
  ```go
  // Bad
  func AuthMiddleware(next http.Handler) http.Handler {
      return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
          db := connectToDB()  // Direct instantiation
          defer db.Close()

          // Complex authentication logic
          if !validateToken(r, db) {
              http.Error(w, "Unauthorized", http.StatusUnauthorized)
              return
          }
          next.ServeHTTP(w, r)
      })
  }
  ```

### Testing Challenges

- Framework-specific testing complexity
- Request/response cycle testing
- Middleware testing
- Context and dependency injection testing

## 8. Design Pattern Anti-Patterns

### Anti-Patterns

- **God Object**

  ```go
  // Bad
  type UserManager struct {
      db *sql.DB
      cache *Cache
      logger *Logger
  }

  func (m *UserManager) CreateUser() error { /* ... */ }
  func (m *UserManager) UpdateUser() error { /* ... */ }
  func (m *UserManager) DeleteUser() error { /* ... */ }
  func (m *UserManager) ProcessPayment() error { /* ... */ }
  func (m *UserManager) SendNotification() error { /* ... */ }
  func (m *UserManager) GenerateReport() error { /* ... */ }
  ```

- **Tight Coupling**

  ```go
  // Bad
  type OrderProcessor struct {
      db *sql.DB
      logger *Logger
      emailService *EmailService
  }

  func NewOrderProcessor() *OrderProcessor {
      return &OrderProcessor{
          db: connectToDB(),
          logger: NewLogger(),
          emailService: NewEmailService(),
      }
  }
  ```

### Testing Challenges

- Complex object graphs
- Difficult to mock dependencies
- High coupling
- Complex test setup
