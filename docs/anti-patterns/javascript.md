# JavaScript/TypeScript Untestable Code Anti-Patterns

## 1. Global State and Module Scope Pollution

### Anti-Patterns

- **Global Variable Dependencies**

  ```javascript
  // Bad
  const config = {
    apiKey: "secret-key",
    baseUrl: "https://api.example.com",
  };
  window.appConfig = config; // Global state

  // Usage
  function fetchData() {
    return fetch(window.appConfig.baseUrl + "/data");
  }
  ```

- **Module-Level State**

  ```javascript
  // Bad
  let cache = {}; // Module-level state

  export function getData(id) {
    if (cache[id]) return cache[id];
    cache[id] = fetchData(id);
    return cache[id];
  }
  ```

### Testing Challenges

- Tests can't run in isolation
- State leaks between tests
- Order-dependent test execution
- Difficult to mock global dependencies

## 2. Asynchronous Code Anti-Patterns

### Anti-Patterns

- **Callback Hell**

  ```javascript
  // Bad
  function processUserData(userId, callback) {
    getUser(userId, (user) => {
      getPermissions(user.id, (permissions) => {
        getSettings(user.id, (settings) => {
          callback({ user, permissions, settings });
        });
      });
    });
  }
  ```

- **Unhandled Promise Rejections**
  ```javascript
  // Bad
  async function fetchData() {
    const response = await fetch("/api/data");
    return response.json(); // No error handling
  }
  ```

### Testing Challenges

- Complex test setup for async operations
- Timing-dependent tests
- Difficult to test error scenarios
- Race conditions in tests

## 3. Type System Abuse

### Anti-Patterns

- **Type Assertion Overuse**

  ```typescript
  // Bad
  function processData(data: unknown) {
    const userData = data as UserData; // Unsafe type assertion
    return userData.name;
  }
  ```

- **Any Type Usage**
  ```typescript
  // Bad
  function handleData(data: any) {
    return data.process(); // No type safety
  }
  ```

### Testing Challenges

- Runtime type errors
- Difficult to mock with correct types
- Type-related bugs in tests
- Incomplete test coverage due to type uncertainty

## 4. Dependency Management Anti-Patterns

### Anti-Patterns

- **Direct Module Imports**

  ```javascript
  // Bad
  import { database } from "./database";

  export function saveUser(user) {
    return database.save(user); // Direct dependency
  }
  ```

- **Circular Dependencies**

  ```javascript
  // Bad
  // user.js
  import { saveUser } from "./userService";
  export class User {
    save() {
      return saveUser(this);
    }
  }

  // userService.js
  import { User } from "./user";
  export function saveUser(user) {
    // Implementation
  }
  ```

### Testing Challenges

- Difficult to mock dependencies
- Tests affected by implementation details
- Complex setup for isolated testing
- Order-dependent module loading

## 5. Class and Object Anti-Patterns

### Anti-Patterns

- **Prototype Pollution**

  ```javascript
  // Bad
  Object.prototype.customMethod = function () {
    // Modifying global Object prototype
  };
  ```

- **Private Implementation Exposure**
  ```javascript
  // Bad
  class User {
    constructor() {
      this._internalState = {}; // Supposed to be private
    }

    getInternalState() {
      return this._internalState; // Exposing private state
    }
  }
  ```

### Testing Challenges

- Global side effects
- Brittle tests due to implementation details
- Difficult to test private methods
- State leakage between tests

## 6. Testing Anti-Patterns

### Anti-Patterns

- **Test Implementation Details**

  ```javascript
  // Bad
  test("should update internal counter", () => {
    const service = new Service();
    service.process();
    expect(service._counter).toBe(1); // Testing private implementation
  });
  ```

- **Async Test Timeouts**
  ```javascript
  // Bad
  test('should complete async operation', () => {
    const result = await longRunningOperation();
    expect(result).toBeDefined();
  }, 10000);  // Arbitrary timeout
  ```

### Testing Challenges

- Brittle tests
- False positives/negatives
- Difficult to maintain
- Unreliable test execution

## 7. Framework-Specific Anti-Patterns

### Anti-Patterns

- **Component State Management**

  ```javascript
  // Bad (React)
  function UserProfile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
      setLoading(true);
      fetchUser()
        .then(setUser)
        .catch(setError)
        .finally(() => setLoading(false));
    }, []); // Complex state management
  }
  ```

- **Direct DOM Manipulation**
  ```javascript
  // Bad
  function updateUI() {
    document.getElementById("result").innerHTML = data; // Direct DOM manipulation
  }
  ```

### Testing Challenges

- Complex component testing
- Difficult to test side effects
- DOM manipulation testing complexity
- Framework-specific testing requirements
