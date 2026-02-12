# Code Style and Workflow Guidelines for C4 Assist DSL

## TDD Workflow (Mandatory)

Before writing or modifying any implementation code, you MUST follow these steps:

1.  **Check for existing tests**: Look for a corresponding `.test.ts` file for the module you are about to change.
2.  **Write/Update tests FIRST**: Define the expected behavior by adding new test cases or updating existing ones.
3.  **Verify test failure**: Run the tests to ensure they fail as expected (Red phase).
4.  **Implement/Refactor**: Write the code to make the tests pass (Green phase).
5.  **Verify test success**: Run the tests again to ensure everything works and no regressions were introduced.

## Architecture Rules

### 1. Use `parseDocumentWithIncludes()` for cross-file data

```typescript
// GOOD ✅
import { parseDocumentWithIncludes } from './workspaceIndex';
const { allDefinitions } = await parseDocumentWithIncludes(document);

// BAD ❌ — duplicates parse+include logic
const parser = new DslParser(document.getText(), document.uri);
const parsed = parser.parse();
const resolver = getIncludeResolver();
const docs = await resolver.getIncludedDocuments(...);
for (const doc of docs) { /* parse each... */ }
```

### 2. Add shared view keywords to `BASE_VIEW_KEYWORDS`

```typescript
// GOOD ✅ — single source of truth
const BASE_VIEW_KEYWORDS: KeywordInfo[] = [
    { keyword: 'include', ... },
    // add new shared keyword here
];

// BAD ❌ — copy-pasting to 8 view contexts
[ContextType.SystemLandscapeView]: [
    { keyword: 'include', ... },
    { keyword: 'newKeyword', ... }, // duplicated in every view
],
```

### 3. Use `DslParser` for identifier extraction

Do not write custom regex patterns duplicating `DslParser.parse()` logic.

---

## Comment Rules

### BAD ❌

```typescript
// Find identifiers in current document
for (const pattern of patterns) {
```

```typescript
// Check if it's a reference
if (isReference) {
```

### GOOD ✅

No comments for obvious things. Code should be self-documenting.

## When to Use Comments

### GOOD ✅ - JSDoc for functions

```typescript
/**
 * Parse !include directives from DSL text
 * Pattern: !include "filename.dsl" or !include filename.dsl
 */
parseIncludeDirectives(text: string, documentUri: vscode.Uri): IncludeDirective[] {
```

### GOOD ✅ - TODO/FIXME notes

```typescript
// This is a simplified count - in real implementation would use the parser's references
private countReferences(identifier: string, parsed): number {
```

### GOOD ✅ - Non-obvious logic

```typescript
// Skip include directives to avoid parsing file paths as identifiers
if (trimmed.startsWith("!include")) {
  return;
}
```

---

## Code Structure

### Function Documentation

Every exported function/class MUST have JSDoc explaining:

- What it does
- Parameters (if any)
- Important patterns or edge cases

### Inline Comments

Only add inline comments when:

1. Explaining WHY (not WHAT)
2. Documenting a TODO/FIXME
3. Explaining non-obvious logic
4. Warning about edge cases or limitations

---

## Quick Checklist Before Adding Comments

- [ ] Does the comment explain WHY, not WHAT?
- [ ] Is the logic non-obvious?
- [ ] Is this a TODO/FIXME?
- [ ] Can the code be refactored to be self-documenting instead?

If all answers are NO → DON'T ADD THE COMMENT
