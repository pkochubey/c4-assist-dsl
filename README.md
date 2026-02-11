# C4 Assist DSL

**Complete Structurizr DSL support for Visual Studio Code**

Boost your architecture documentation productivity with intelligent code assistance for the Structurizr DSL language. This extension provides syntax highlighting, smart autocomplete, validation, and navigation features for creating C4 models directly in VS Code.

---

## Features

### IntelliSense Autocomplete
Context-aware suggestions that understand your code structure:
- **Scope-based suggestions** - Only relevant keywords for your current context
- **Identifier completion** - Quick access to your defined elements
- **Property and value suggestions** - Shapes, colors, routing styles, and more
- **Smart filtering** - Type to narrow down suggestions instantly

### Rich Hover Documentation
Hover over any keyword or element to see:
- Complete syntax reference
- Description and usage examples
- Direct links to official Structurizr documentation

### Navigation & Code Actions
- **Go to Definition** (F12) - Jump to element definitions
- **Find All References** - See where elements are used
- **Rename Symbol** (F2) - Safely rename elements across your file

### Real-time Validation
Instant feedback on:
- Duplicate identifiers
- References to undefined elements
- Common syntax errors
- Invalid patterns

### Formatting
Auto-format your DSL files with consistent indentation and spacing.

### Syntax Highlighting
Beautiful color-coded syntax for better code readability.

---

## Installation

### From VS Code Marketplace
1. Open VS Code
2. Press `Ctrl+Shift+X` (Windows/Linux) or `Cmd+Shift+X` (macOS)
3. Search for **C4 Assist DSL**
4. Click **Install**

### From VSIX
1. Download the latest `.vsix` release
2. In VS Code: **Extensions** → **...** → **Install from VSIX...**
3. Select the downloaded file

---

## Getting Started

Create a new file with the `.dsl` extension and start typing. The extension will automatically provide suggestions as you work.

### Example

```dsl
workspace "My Software System" {
    model {
        user = person "User"
        system = softwareSystem "Software System" {
            webapp = container "Web App" "React" "SPA"
            api = container "API" "Node.js" "REST"
            db = container "Database" "PostgreSQL" "Relational"
        }
        user -> webapp "Uses"
        webapp -> api "HTTPS"
        api -> db "JDBC"
    }

    views {
        systemContext system {
            include *
        }
        container system {
            include *
        }
    }
}
```

---

## Extension Settings

Open VS Code Settings (`,`) and search for **c4assist**:

| Setting | Description | Default |
|---------|-------------|----------|
| `c4AssistDsl.completion.enable` | Enable/disable autocomplete suggestions | `true` |
| `c4AssistDsl.diagnostics.enable` | Enable/disable real-time validation | `true` |

---

## Supported Keywords

The extension supports the complete Structurizr DSL language:

**Elements**: `workspace`, `model`, `person`, `softwareSystem`, `container`, `component`, `deploymentNode`, `infrastructureNode`, `group`

**Views**: `systemLandscape`, `systemContext`, `container`, `component`, `filtered`, `dynamic`, `deployment`, `custom`

**Styling**: `styles`, `element`, `relationship`, `theme`, `shape`, `color`, `border`, `opacity`, `routing`

**Directives**: `!identifiers`, `!include`, `!docs`, `!adrs`, `!element`, `!relationship`

**Properties**: `name`, `description`, `technology`, `tags`, `url`, `properties`, `perspectives`

---

## Requirements

- Visual Studio Code 1.80.0 or higher
- No additional dependencies

---

## Learn More

- [Structurizr DSL Documentation](https://docs.structurizr.com/dsl) - Official language reference
- [C4 Model](https://c4model.com/) - Learn about C4 architecture modeling
- [Structurizr](https://structurizr.com/) - Diagram generation from DSL

---

## License

[MIT](LICENSE)

---

## Feedback & Support

Found a bug or have a feature request? Please open an issue on [GitHub](https://github.com/pkochubey/c4-assist-dsl/issues).

Enjoy creating beautiful architecture diagrams!
