# Quick Reference - C4 Assist DSL

## File Locations

| File | Purpose | Key Classes/Functions |
|------|---------|----------------------|
| `extension.ts` | Provider registration | `activate()` |
| `completionProvider.ts` | Autocomplete | `DslCompletionProvider`, `CompletionItemFactory` |
| `dslContext.ts` | Context detection | `DslContextParser.getContext()` |
| `dslParser.ts` | Parse definitions/references | `DslParser.parse()` |
| `diagnosticProvider.ts` | Validation | `DslDiagnosticProvider.validateDocument()` |
| `formatterProvider.ts` | Formatting | `DslFormatterProvider.formatDocument()` |
| `hoverProvider.ts` | Hover docs | `DslHoverProvider.provideHover()` |
| `definitionProvider.ts` | Go to definition | `DslDefinitionProvider.provideDefinition()` |
| `renameProvider.ts` | Rename symbol | `DslRenameProvider.provideRenameEdits()` |
| `dslData.ts` | Constants | `KEYWORDS_BY_CONTEXT`, `ContextType` |
| `keywordDocumentation.ts` | Keyword docs | `KEYWORD_DOCUMENTATION` |
| `includeResolver.ts` | !include handling | `IncludeResolver.getIncludedDocuments()` |

## Common Tasks

### Add new keyword to autocomplete
1. Add to `KEYWORDS_BY_CONTEXT` in `dslData.ts`
2. Add docs to `KEYWORD_DOCUMENTATION` in `keywordDocumentation.ts`

### Fix completion not showing
- Check `KEYWORDS_BY_CONTEXT` has keyword for current context
- Check `triggerCharacters` in `extension.ts` (NOT `'\n'`)
- Check empty line suppression in `completionProvider.ts`

### Add new enum values
1. Add constant to `dslData.ts` (e.g., `SHAPE_VALUES`)
2. Add to `valueMap` in `completionProvider.ts.addValueProviders()`

### Fix formatter issue
- Check `formatterProvider.ts.formatLine()`
- Special handling for `->` at line start already implemented

## Important Constants

```typescript
// Element types for completion after '='
ELEMENT_TYPE_KEYWORDS = ['person', 'softwareSystem', 'container', ...]

// Keywords that trigger element type completion
KEYWORDS_AFTER_EQUALS = ['user', 'users', 'group', 'in', 'of']

// Special identifiers (not errors if undefined)
SPECIAL_IDENTIFIERS = ['*', 'this']

// Trigger characters (NO '\n'!)
triggerCharacters = [' ', '>', '=', '(', '"']
```

## DSL Syntax Examples

```dsl
// Element definition
user = person "User"
system = softwareSystem "System" "Description" {
    container = container "Database" "Stores data"
}

// Relationship
user -> system "Uses"

// View
systemContext system {
    include *
}

// Include
!include "common.dsl"
```
