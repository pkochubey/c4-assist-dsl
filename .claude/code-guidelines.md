# Code Style Guidelines for C4 Assist DSL

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

```typescript
// +1 for newline
currentOffset += line.length + 1;
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

```typescript
// Approximate end position
const endPosition = new vscode.Position(includeDef.line - 1, 100);
```

### GOOD ✅ - Non-obvious logic explanations
```typescript
// Skip include directives to avoid parsing file paths as identifiers
if (trimmed.startsWith('!include')) {
    return;
}
```

## Code Structure

### Function Documentation
Every exported function/class MUST have JSDoc explaining:
- What it does
- Parameters (if any)
- Return value (if any)
- Important patterns or edge cases

```typescript
/**
 * Manages DSL file includes and provides cached access to included files
 */
export class IncludeResolver {
```

### Inline Comments
Only add inline comments when:
1. Explaining WHY (not WHAT)
2. Documenting a TODO/FIXME
3. Explaining non-obvious logic
4. Warning about edge cases or limitations

## Examples

### Self-Documenting Code (No comments needed)
```typescript
const identifiers = new Set<string>();

if (this.cache.has(filePath)) {
    return this.cache.get(filePath);
}
```

### Complex Logic (Comment helpful)
```typescript
// Recursively resolve nested includes to get all transitive dependencies
const nestedIncludes = await this.getIncludedDocuments(doc.uri, doc.content);
documents.push(...nestedIncludes);
```

## Quick Checklist Before Adding Comments

- [ ] Does the comment explain WHY, not WHAT?
- [ ] Is the logic non-obvious?
- [ ] Is this a TODO/FIXME?
- [ ] Can the code be refactored to be self-documenting instead?

If all answers are NO → DON'T ADD THE COMMENT
