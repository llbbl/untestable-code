# Untestable Code Characteristics

Untestable code refers to code that is difficult or impossible to effectively test using standard testing practices. Here are the key characteristics that make code untestable:

1. **Hard-coded Dependencies**

   - Direct instantiation of dependencies within classes
   - No way to inject mock objects or test doubles
   - Makes unit testing impossible without modifying the code

2. **Global State**

   - Shared mutable state across multiple components
   - Static variables and singletons that maintain state
   - Makes tests non-deterministic and dependent on execution order

3. **Hidden Side Effects**

   - Methods that modify state without clear indication
   - Unexpected interactions with external systems
   - Makes it difficult to verify behavior in isolation

4. **Complex Logic**

   - Methods with multiple responsibilities
   - Deeply nested conditionals
   - Complex algorithms without clear boundaries
   - Makes it difficult to test all possible paths

5. **Non-deterministic Behavior**

   - Code that depends on time, random numbers, or external state
   - Network calls or file system operations
   - Makes tests flaky and unreliable

6. **Private Method Complexity**

   - Complex logic hidden in private methods
   - No way to test edge cases or error conditions
   - Forces testing through public interfaces only

7. **Tight Coupling**

   - Classes that are highly dependent on each other
   - No clear separation of concerns
   - Makes it difficult to test components in isolation

8. **Constructor Side Effects**
   - Constructors that perform complex initialization
   - Object creation that triggers external system interactions
   - Makes it difficult to create test instances

These characteristics often overlap and compound each other, making code increasingly difficult to test. The goal of this project is to demonstrate these patterns and show how to refactor them into more testable code.

# Criteria for Good Untestable Code Examples

A good example of untestable code should meet the following criteria:

1. **Clear Demonstration**

   - The example should clearly and vividly demonstrate one specific untestable pattern
   - The anti-pattern should be immediately recognizable to readers
   - The code should be simple enough to understand quickly, but complex enough to be realistic

2. **Real-World Relevance**

   - The example should reflect patterns commonly found in production code
   - It should solve a real problem that developers might encounter
   - The code should be practical and not artificially constructed

3. **Educational Value**

   - The example should clearly show why the code is difficult to test
   - It should highlight the specific testing challenges it creates
   - The problems should be relatable to developers' everyday experiences

4. **Minimal Complexity**

   - The example should be as simple as possible while still demonstrating the pattern
   - It should avoid mixing multiple anti-patterns unless specifically demonstrating their interaction
   - The code should be self-contained and not require extensive context to understand

5. **Reproducible Issues**

   - The example should consistently demonstrate the testing problems it's meant to illustrate
   - The issues should be reproducible across different testing frameworks
   - The problems should be clear and not dependent on specific implementation details

6. **Clear Refactoring Path**

   - There should be a clear and obvious way to refactor the code to make it testable
   - The refactoring should demonstrate well-established testing best practices
   - The improvements should be significant enough to justify the refactoring effort

7. **Language Appropriateness**

   - The example should be idiomatic for the language it's written in
   - It should use language-specific features that contribute to the untestability
   - The example should be relevant to the language's common testing practices

8. **Documentation Quality**
   - The example should include clear comments explaining why it's untestable
   - It should document the specific testing challenges it presents
   - The example should be accompanied by a clear explanation of the anti-pattern it demonstrates

These criteria ensure that our examples are not just theoretical exercises but practical learning tools that help developers recognize and avoid untestable code patterns in their own work.

# Language Selection

## Initial Languages

We will start with the following languages, chosen for their widespread use and distinct characteristics that often lead to untestable code patterns:

1. **JavaScript/TypeScript**

   - Dynamic typing and prototype-based inheritance
   - Asynchronous patterns and callbacks
   - Global scope and module system quirks
   - Heavy use in web development

2. **Python**

   - Dynamic typing and duck typing
   - Global interpreter lock (GIL)
   - Module-level code execution
   - Popular in data science and scripting

3. **Java**

   - Static typing and OOP principles
   - Enterprise patterns and frameworks
   - Reflection and annotation processing
   - Widely used in enterprise applications

4. **C#**

   - Static typing with modern features
   - LINQ and async/await patterns
   - Dependency injection frameworks
   - Common in Windows and .NET development

5. **Go**
   - Static typing with simplicity focus
   - Goroutines and channels
   - Interface-based programming
   - Growing in cloud-native development

## Future Language Expansion

The following languages are candidates for future inclusion:

1. **Ruby**

   - Metaprogramming capabilities
   - Dynamic typing
   - Rails framework patterns

2. **Rust**

   - Ownership and borrowing
   - Zero-cost abstractions
   - Systems programming patterns

3. **Kotlin**

   - JVM interoperability
   - Coroutines
   - Android development patterns

4. **Swift**
   - Protocol-oriented programming
   - Optionals and memory management
   - iOS/macOS development patterns

## Selection Criteria

Languages were chosen based on:

1. **Industry Adoption**: Languages with significant market share and active communities
2. **Testing Challenges**: Languages with unique features that often lead to testing difficulties
3. **Learning Value**: Languages that demonstrate distinct patterns of untestable code
4. **Community Support**: Languages with active testing communities and established practices
5. **Documentation Quality**: Languages with good documentation and learning resources

This selection provides a good balance of:

- Different programming paradigms
- Various application domains
- Different levels of type safety
- Different concurrency models
- Different ecosystem characteristics
