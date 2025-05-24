# **Untestable Code Examples Library**

This document outlines the tasks for creating a curated collection of code examples that demonstrate common patterns of untestable code across various programming languages. The goal is to provide a learning resource for developers to understand, identify, and avoid such patterns.

## **1. Project Foundation & Scope**

### **Defining "Untestable Code"**

- [x] Clearly define the characteristics of "untestable code" for this project (e.g., hard-coded dependencies, global state, hidden side effects, complex logic, non-determinism, private method complexity).
- [x] Establish criteria for what makes an example "good" for demonstrating an untestable pattern.

### **Target Audience & Goals**

- [ ] Identify the primary target audience (e.g., junior to mid-level developers, students, educators).
- [ ] Define the main learning objectives for users of this library.

### **Language Selection**

- [ ] Determine the initial set of programming languages to be included (e.g., Java, Python, JavaScript, C\\#, Go, Ruby).
- [ ] Plan for potential future expansion to other languages.

## **2. Anti-Pattern Identification & Curation**

### **Research & Categorization**

- [ ] Research and compile a list of common anti-patterns that lead to untestable code, specific to each chosen language.
- [ ] Categorize these anti-patterns (e.g., "Tight Coupling," "Global State Abuse," "Complex Conditional Logic," "Non-Deterministic Behavior," "Untestable Private Methods," "Side Effects in Constructors").
- [ ] For each anti-pattern, describe its negative impact on testability.

### **Prioritization**

- [ ] Prioritize which anti-patterns to focus on initially for each language, based on commonality and impact.

## **3. Code Example Development**

### **Creating "Untestable" Examples**

- [ ] For each selected anti-pattern and language:
  - [ ] Develop a concise and clear code snippet that vividly demonstrates the untestable pattern.
  - [ ] Ensure the example is focused on the specific anti-pattern.
  - [ ] Add comments within the code explaining _why_ it's challenging to test.

### **Creating "Testable" Counter-Examples (Highly Recommended)**

- [ ] For each "untestable" example:
  - [ ] Develop a corresponding "testable" version that refactors the code to improve its testability.
  - [ ] Highlight the changes made and explain how they facilitate testing.
  - [ ] (Optional) Include a basic unit test snippet for the "testable" version to demonstrate its testability.

### **Example Standards**

- [ ] Establish consistent coding style and formatting guidelines for examples across all languages.
- [ ] Ensure all examples are self-contained and minimalistic, avoiding unnecessary complexity.
- [ ] Verify that examples compile/run where appropriate (for the "untestable" version, the point is it _runs_ but is hard to _test_).

## **4. Explanatory Content & Documentation**

### **Anti-Pattern Explanations**

- [ ] For each anti-pattern category:
  - [ ] Write a clear, language-agnostic (or language-aware where necessary) explanation of the anti-pattern.
  - [ ] Describe common scenarios where it arises.
  - [ ] Explain the specific challenges it poses for unit testing.
  - [ ] Provide general principles or refactoring techniques to avoid or fix it.

### **Example Annotations**

- [ ] Accompany each code example (both untestable and testable versions) with a brief textual explanation.
- [ ] Clearly link the example code to the specific anti-pattern it demonstrates.

### **Project README & Navigation**

- [ ] Create a main README.md for the project/repository.
  - [ ] Explain the project's purpose and how to use the library.
  - [ ] Provide a clear table of contents or navigation structure to find examples by language and/or anti-pattern.
- [ ] Consider creating separate README files or sections for each language.

## **5. Repository & Presentation Structure**

### **Directory Organization**

- [ ] Define a logical and consistent directory structure (e.g., /[language]/[anti\_pattern\_category]/untestable_example.[ext], /[language]/[anti\_pattern\_category]/testable_example.[ext]).
- [ ] Ensure easy navigation of the codebase.

### **Presentation Format**

- [ ] Decide on the primary presentation format (e.g., a GitHub repository with Markdown files embedding code snippets).
- [ ] Ensure code examples are easily viewable and copy-pasteable.
- [ ] (Future Scope) Consider a simple static website generated from the content for enhanced readability.

## **6. Review, Quality Assurance & Iteration**

### **Content Review**

- [ ] Conduct peer reviews of all code examples for:
  - [ ] Accuracy in demonstrating the anti-pattern.
  - [ ] Clarity and conciseness.
  - [ ] Correctness of the "testable" refactoring.
- [ ] Review all explanatory text for accuracy, clarity, and completeness.

### **Usability Testing**

- [ ] (Optional) Have target audience members try to use the library and provide feedback.

### **Continuous Improvement**

- [ ] Establish a process for adding new examples, languages, or anti-patterns.
- [ ] Create a mechanism for users to suggest improvements or report errors (e.g., GitHub Issues).

## **7. Contribution Guidelines (If Open-Sourcing)**

### **Defining Contribution Process**

- [ ] If the project is open source, create clear CONTRIBUTING.md guidelines.
- [ ] Specify how to propose new examples or anti-patterns.
- [ ] Outline coding standards and review processes for contributions.
- [ ] Provide templates for bug reports or feature/example requests.
