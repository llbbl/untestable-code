# Anti-Pattern Prioritization by Language

This document outlines the priority order for implementing anti-pattern examples in each language, based on:

1. How commonly the anti-pattern appears in real-world code
2. The severity of its impact on testability
3. The difficulty of testing code with this anti-pattern
4. The educational value of demonstrating the anti-pattern

## JavaScript/TypeScript

### High Priority

1. **Global State and Module Scope Pollution**

   - Extremely common in JavaScript due to its global scope
   - Major impact on test isolation
   - Easy to demonstrate with real-world examples

2. **Asynchronous Code Anti-Patterns**

   - Core to JavaScript's nature
   - Critical for understanding async testing
   - Common source of testing difficulties

3. **Dependency Management Anti-Patterns**
   - Common in Node.js and browser environments
   - Critical for understanding module testing
   - High impact on testability

### Medium Priority

4. **Type System Abuse** (TypeScript-specific)

   - Growing importance with TypeScript adoption
   - Important for type-safe testing
   - Common in transitioning codebases

5. **Framework-Specific Anti-Patterns**
   - Common in React, Angular, Vue applications
   - Important for frontend testing
   - High practical value

### Lower Priority

6. **Testing Anti-Patterns**
7. **Class and Object Anti-Patterns**
8. **Resource Management Anti-Patterns**

## Python

### High Priority

1. **Module-Level Code Execution**

   - Unique to Python's module system
   - Major impact on test isolation
   - Common source of testing problems

2. **Global State and Mutable Defaults**

   - Python-specific issues with mutable defaults
   - Common source of bugs
   - Important for understanding Python's behavior

3. **Resource Management Anti-Patterns**
   - Critical for Python's context managers
   - Common in file and database operations
   - High impact on test reliability

### Medium Priority

4. **Class Design Anti-Patterns**

   - Important for OOP in Python
   - Common in larger codebases
   - Significant testing challenges

5. **Exception Handling Anti-Patterns**
   - Python's exception system is unique
   - Common source of testing difficulties
   - Important for robust testing

### Lower Priority

6. **Testing Anti-Patterns**
7. **Concurrency Anti-Patterns**
8. **Framework-Specific Anti-Patterns**

## Java

### High Priority

1. **Static State and Singletons**

   - Very common in Java enterprise code
   - Major impact on testability
   - Critical for understanding Java testing

2. **Constructor Anti-Patterns**

   - Common in Java's OOP paradigm
   - Critical for dependency injection
   - High impact on test setup

3. **Exception Handling Anti-Patterns**
   - Java's checked exceptions are unique
   - Common source of testing difficulties
   - Important for robust testing

### Medium Priority

4. **Resource Management Anti-Patterns**

   - Critical for Java's resource handling
   - Common in enterprise applications
   - Important for reliable testing

5. **Framework-Specific Anti-Patterns**
   - Common in Spring, JPA applications
   - Important for enterprise testing
   - High practical value

### Lower Priority

6. **Testing Anti-Patterns**
7. **Concurrency Anti-Patterns**
8. **Design Pattern Anti-Patterns**

## C#

### High Priority

1. **Static State and Singletons**

   - Common in .NET applications
   - Major impact on testability
   - Critical for understanding C# testing

2. **Dependency Injection Anti-Patterns**

   - Core to .NET development
   - Critical for modern C# testing
   - High impact on testability

3. **Resource Management Anti-Patterns**
   - Critical for .NET's IDisposable pattern
   - Common in enterprise applications
   - Important for reliable testing

### Medium Priority

4. **Framework-Specific Anti-Patterns**

   - Common in ASP.NET, Entity Framework
   - Important for enterprise testing
   - High practical value

5. **Exception Handling Anti-Patterns**
   - Important for robust C# testing
   - Common source of testing difficulties
   - Critical for enterprise applications

### Lower Priority

6. **Testing Anti-Patterns**
7. **Concurrency Anti-Patterns**
8. **Design Pattern Anti-Patterns**

## Go

### High Priority

1. **Package-Level State**

   - Unique to Go's package system
   - Major impact on test isolation
   - Common source of testing problems

2. **Interface Anti-Patterns**

   - Core to Go's design philosophy
   - Critical for understanding Go testing
   - High impact on testability

3. **Error Handling Anti-Patterns**
   - Go's error handling is unique
   - Common source of testing difficulties
   - Important for robust testing

### Medium Priority

4. **Resource Management Anti-Patterns**

   - Critical for Go's resource handling
   - Common in system applications
   - Important for reliable testing

5. **Concurrency Anti-Patterns**
   - Core to Go's design
   - Important for understanding goroutines
   - High practical value

### Lower Priority

6. **Testing Anti-Patterns**
7. **Framework-Specific Anti-Patterns**
8. **Design Pattern Anti-Patterns**

## Implementation Strategy

1. **Phase 1: High Priority Patterns**

   - Implement examples for all high-priority patterns
   - Focus on clear, concise demonstrations
   - Include both untestable and testable versions

2. **Phase 2: Medium Priority Patterns**

   - Implement examples for medium-priority patterns
   - Build on lessons from high-priority patterns
   - Include framework-specific examples

3. **Phase 3: Lower Priority Patterns**
   - Implement remaining patterns
   - Focus on unique language-specific aspects
   - Include advanced testing scenarios

## Success Criteria

For each implemented anti-pattern:

1. Clear demonstration of the testing challenge
2. Practical, real-world example
3. Working untestable version
4. Refactored testable version
5. Clear explanation of the problems and solutions
