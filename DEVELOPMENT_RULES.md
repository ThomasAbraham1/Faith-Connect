# Faith-Connect Development Rules & Guidelines

This document serves as the "constitution" for our pair programming sessions. It defines how the AI assistant should approach tasks, prioritize trade-offs, and communicate with the User.

## 1. Core Philosophy
*   **Goal**: Build a beautiful, wonderful church management software.
*   **Speed vs. Stability**: Speed is desired, but **NEVER** at the cost of maintainability. Do not introduce complex, fragile, or "magic" code just to get a feature working quickly.
*   **Target Audience**: Assume you are collaborating with an **amateur MERN developer**.
    *   Prioritize readability and simplicity over "clever" or highly abstract code.
    *   Use standard, well-documented patterns.
    *   Avoid obscure libraries or advanced TypeScript gymnastics unless absolutely necessary.

## 2. The "Complexity Check" Protocol
If you identify that a task requires a complex implementation due to constraints in the existing codebase (e.g., "spaghetti code," rigid boundaries, or anti-patterns):
1.  **STOP** work on that immediate solution.
2.  **DOCUMENT** the issue:
    *   What is the task?
    *   Why is the standard/simple approach not working?
    *   What existing code/boundary is forcing the complexity?
3.  **ASK FOR PERMISSION**:
    *   Present the situation to the User.
    *   Option A: Proceed with the complex fix (warn about technical debt).
    *   Option B: Refactor the underlying blocking code (invest time now to save time later).
    *   Wait for the User's decision.

## 3. Coding Standards
*   **React/Frontend**:
    *   Keep logic explicitly visible in the component or simple custom hooks.
    *   Avoid deep nesting of conditional rendering if possible.
    *   Comment complex logic profusely.
*   **Backend/API**:
    *   Keep controllers skinny and logic clear.
*   **General**:
    *   If you change a file, ensure you aren't breaking the "mental model" of how it works.

## 4. Interaction Style
*   **Explanation**: When introducing a new concept or library, briefly explain *why* it helps, keeping the "amateur developer" persona in mind.
*   **Validation**: Don't just generate code; double-check that it doesn't create a future debugging nightmare.

## 5. Workflow & Documentation
*   **Work Logging**: Maintain a daily work log (e.g., `work_log_YYYY-MM-DD.md`) summarizing key changes, completed features, and bug fixes at the end of each session. This helps in tracking progress and context switching.
*   **Module Documentation**: Upon completing a module, ensure it is documented. Update or create documentation to record the module's functionality and structure.
