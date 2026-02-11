# C4 Assist DSL - Structurizr Support

[Structurizr DSL](https://docs.structurizr.com/dsl) language support for Visual Studio Code including syntax highlighting and intelligent autocomplete for the C4 model.

## Features

- **Syntax Highlighting**: Color-coded Structurizr DSL syntax
- **Intelligent Autocomplete**: Context-aware suggestions based on:
  - Current scope (workspace, model, views, etc.)
  - Nesting rules (what can be nested where)
  - Element identifiers defined in the document
  - Keywords, properties, and special values

## Installation

1. Build the extension:
   ```bash
   npm install
   npm run compile
   ```

2. Package the extension:
   ```bash
   # Optionally install vsce: npm install -g vsce
   vsce package
   ```

3. Install the `.vsix` file in VS Code

## Usage

Create a file with the `.dsl` extension and start writing Structurizr DSL code:

```dsl
workspace "My Architecture" "Description of my architecture" {

    model {
        user = person "User"
        softwareSystem = softwareSystem "Software System" {
            webapp = container "Web Application" "Web application" "Technology"
        }
        user -> softwareSystem "Uses"
    }

    views {
        systemContext softwareSystem {
            include *
        }
    }
}
```

## Supported Keywords

The extension supports all Structurizr DSL keywords including:

### Elements
- `workspace`, `person`, `softwareSystem`, `container`, `component`
- `deploymentEnvironment`, `deploymentNode`, `infrastructureNode`
- `softwareSystemInstance`, `containerInstance`
- `group`, `element`

### Views
- `systemLandscape`, `systemContext`, `container`, `component`
- `filtered`, `dynamic`, `deployment`, `custom`, `image`

### Styling
- `styles`, `theme`, `branding`
- `shape`, `icon`, `color`, `border`, `opacity`

### Directives
- `!identifiers`, `!include`, `!docs`, `!adrs`
- `!element`, `!relationship`, `!script`, `!plugin`

## Settings

- `c4AssistDsl.completion.enable`: Enable/disable autocomplete (default: `true`)

## Development

### Build

```bash
npm install
npm run compile
```

### Watch mode

```bash
npm run watch
```

### Package extension

```bash
npm run package
```

### Publish to marketplace

```bash
npm run publish
```

## License

MIT

## References

- [Structurizr DSL Documentation](https://docs.structurizr.com/dsl)
- [C4 Model](https://c4model.com/)
