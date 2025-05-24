

Based on the directory listing and our progress, here's the status of Python anti-patterns:
Completed:
✅ Hard-coded Dependencies
✅ Complex Logic
✅ Global State (just created)
✅ Hidden Side Effects
Still to do:
Non-deterministic Behavior
Private Method Complexity
Tight Coupling
Constructor Side Effects



Based on the documentation and our progress so far, here are the high-priority anti-patterns for JavaScript/TypeScript that we should work on:

1. ✅ **Hard-coded Dependencies**
   - Direct instantiation of dependencies within classes
   - No way to inject mock objects or test doubles
   - Makes unit testing impossible without modifying the code

2. ✅ **Global State**
   - Shared mutable state across multiple components
   - Static variables and singletons that maintain state
   - Makes tests non-deterministic and dependent on execution order

3. ✅ **Hidden Side Effects**
   - Methods that modify state without clear indication
   - Unexpected interactions with external systems
   - Makes it difficult to verify behavior in isolation

4. ✅ **Error Handling Anti-Patterns**
   - Swallowing errors
   - Generic error handling
   - Inconsistent error handling
   - Error state mutation
   - Unhandled promise rejections
   - Error propagation issues

5. ✅ **State Management Anti-Patterns**
   - Global mutable state
   - Shared state between components
   - Implicit state dependencies
   - State mutation without boundaries
   - Inconsistent state updates
   - Race conditions

6. **Configuration Anti-Patterns** (Next to work on)
   - Hard-coded configuration values
   - Environment-specific configuration
   - Configuration scattered across codebase
   - No configuration validation
   - Runtime configuration changes
   - Configuration dependencies

7. **Complex Logic Anti-Patterns**
   - Methods with multiple responsibilities
   - Deeply nested conditionals
   - Complex algorithms without clear boundaries
   - Makes it difficult to test all possible paths

8. **Non-deterministic Behavior**
   - Code that depends on time, random numbers, or external state
   - Network calls or file system operations
   - Makes tests flaky and unreliable

9. **Private Method Complexity**
   - Complex logic hidden in private methods
   - No way to test edge cases or error conditions
   - Forces testing through public interfaces only

10. **Tight Coupling**
    - Classes that are highly dependent on each other
    - No clear separation of concerns
    - Makes it difficult to test components in isolation

11. **Constructor Side Effects**
    - Constructors that perform complex initialization
    - Object creation that triggers external system interactions
    - Makes it difficult to create test instances

We've completed the first 5 anti-patterns (marked with ✅). Would you like me to proceed with creating examples for the Configuration Anti-Patterns next?
