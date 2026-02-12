# C4 Assist DSL - Extension Architecture

## Overview

VSCode extension for Structurizr DSL (C4 model) providing syntax highlighting, autocomplete, validation, formatting, and refactoring support.

**Language ID:** `structurizr-dsl`
**File Extension:** `.dsl`

---

## Project Structure

```
src/
├── extension.ts              # Main entry point, provider registration
├── dslData.ts                # Keywords, contexts, enums constants
├── dslContext.ts             # Context parser for autocomplete
├── dslParser.ts              # Document parser (definitions, references)
├── keywordDocumentation.ts   # Hover docs for keywords
├── completionProvider.ts     # Autocomplete logic
├── hoverProvider.ts          # Hover documentation
├── diagnosticProvider.ts     # Validation/diagnostics
├── definitionProvider.ts     # Go to definition
├── renameProvider.ts         # Rename symbol
├── formatterProvider.ts      # Code formatting
└── includeResolver.ts        # !include directive handling
```

---

## File Descriptions

### `extension.ts`
Main activation point. Registers all language providers.

**Important:**
- `triggerCharacters` for completion: `' '`, `'>'`, `'='`, `'('`, `'"'`
- NO `'\n'` in trigger characters (prevents completion on empty line)
- Only ONE completion provider registered (removed duplicate)

### `dslData.ts`
Contains all DSL constants:
- `ContextType` enum - all possible parsing contexts
- `KEYWORDS_BY_CONTEXT` - what keywords available in each context
- `ALL_KEYWORDS` set - for keyword detection
- Enum values: `SHAPE_VALUES`, `AUTOLAYOUT_DIRECTIONS`, etc.

### `dslContext.ts`
Parses text before cursor to determine current context for autocomplete.

**Key class:** `DslContextParser`
- `getContext()` - returns `ParsedContext` with context type, block level, etc.
- `getCurrentWord()` - static method to get word being typed
- `KEYWORD_CONTEXT_MAP` - maps keywords to their resulting contexts

**Parsing logic:**
1. Remove comments
2. Tokenize (handles `->`, `{`, `}`, `=`, whitespace)
3. Track stack of contexts based on `{` and `}`
4. Determine if in relationship (`->`) or string literal

### `dslParser.ts`
Extracts element definitions and references from document.

**Key interfaces:**
- `ElementDefinition` - identifier, type, name, description, technology, line, offsets
- `ElementReference` - identifier usage location
- `ParsedDocument` - definitions map + references array + includes

**Patterns parsed:**
- Definitions: `identifier = person "name"` or `identifier = softwareSystem ...`
- Relationships: `source -> destination "description"`
- View references: `systemContext identifier`, `container identifier`, etc.
- Include directives: `!include "file.dsl"` or `!include file.dsl`

### `keywordDocumentation.ts`
Hover documentation for all DSL keywords.

**Structure:** `KEYWORD_DOCUMENTATION` record with:
- keyword, description, syntax, link, permittedChildren

### `completionProvider.ts`
Autocomplete logic with `CompletionItemFactory` pattern.

**Key features:**
- `CompletionItemFactory` - centralized item creation
- `provideCompletionItems()` - main entry, returns `CompletionList`
- Context-aware suggestions based on `ParsedContext`
- Element type suggestions after `=` (e.g., `user = person`)
- Identifier completion from document + included files
- Special values for specific keywords (shape, autolayout, etc.)

**Constants:**
- `ELEMENT_TYPE_KEYWORDS` - person, softwareSystem, container, etc.
- `KEYWORDS_AFTER_EQUALS` - user, users, group, in, of
- `KEYWORDS_REQUIRING_IDENTIFIER` - systemcontext, container, etc.
- `SPECIAL_IDENTIFIERS` - `*`, `this`

**Important:** Checks if line is empty before showing completion to prevent unwanted triggers.

### `hoverProvider.ts`
Documentation on hover.

**Shows:**
- Keyword documentation from `KEYWORD_DOCUMENTATION`
- Element definitions (type, name, description, technology, line)
- Definitions from included documents when hovering references

### `diagnosticProvider.ts`
Validation and error reporting.

**Checks:**
- Duplicate identifiers
- Undefined references
- Syntax patterns (double assignments, etc.)

**Special identifiers ignored:** `*`, `this`, `true`, `false`

### `definitionProvider.ts`
Go to definition (F12).

**Finds:**
- Local definitions in current document
- Definitions in included documents

### `renameProvider.ts`
Rename symbol (F2).

Validates new identifier and renames all references in current document.

### `formatterProvider.ts`
Document formatting.

**Features:**
- Indentation based on braces
- `->` formatting (no leading space if line starts with `->`)
- Comment and string literal handling
- Multiline string detection

**Important fix:** Lines starting with `->` don't get leading space added.

### `includeResolver.ts`
Handles `!include` directives.

**Features:**
- Caching of included documents
- Recursive include resolution
- Path resolution relative to document directory

---

## Configuration Settings

```json
"c4AssistDsl.completion.enable": true
"c4AssistDsl.diagnostics.enable": true
"c4AssistDsl.formatting.enable": true
```

---

## Common Patterns

### Element Definition
```dsl
identifier = person "Name" "Description" {
    // properties
}
```

### Relationship
```dsl
source -> destination "description" "technology"
```

### Include
```dsl
!include "common.dsl"
```