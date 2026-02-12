import * as vscode from 'vscode';
import { DslParser, ElementDefinition, ParsedDocument } from './dslParser';
import { getIncludeResolver } from './includeResolver';

/**
 * Diagnostic provider for Structurizr DSL validation
 */
export class DslDiagnosticProvider {
    private diagnostics: vscode.DiagnosticCollection;

    constructor(context: vscode.ExtensionContext) {
        this.diagnostics = vscode.languages.createDiagnosticCollection('structurizr-dsl');
        context.subscriptions.push(this.diagnostics);
    }

    /**
     * Validate a document
     */
    async validateDocument(document: vscode.TextDocument): Promise<void> {
        const config = vscode.workspace.getConfiguration('c4AssistDsl');
        const enabled = config.get<boolean>('diagnostics.enable', true);

        if (!enabled) {
            this.diagnostics.delete(document.uri);
            return;
        }

        const diagnostics: vscode.Diagnostic[] = [];
        const parser = new DslParser(document.getText(), document.uri);
        const parsed = parser.parse();

        const includeResolver = getIncludeResolver();
        const includedDocs = await includeResolver.getIncludedDocuments(document.uri, document.getText());
        const allDefinitions = new Map<string, ElementDefinition>(parsed.definitions);

        for (const doc of includedDocs) {
            const includeParser = new DslParser(doc.content, doc.uri);
            const includeParsed = includeParser.parse();

            for (const [identifier, definition] of includeParsed.definitions) {
                if (!allDefinitions.has(identifier)) {
                    allDefinitions.set(identifier, definition);
                }
            }
        }

        diagnostics.push(...this.checkDuplicateIdentifiers(parsed));
        diagnostics.push(...this.checkUndefinedReferences(parsed, allDefinitions));
        diagnostics.push(...this.checkSyntaxPatterns(document));

        this.diagnostics.set(document.uri, diagnostics);
    }

    /**
     * Check for duplicate element identifiers
     */
    private checkDuplicateIdentifiers(parsed: ParsedDocument): vscode.Diagnostic[] {
        const diagnostics: vscode.Diagnostic[] = [];
        const seenIdentifiers = new Map<string, ElementDefinition>();

        for (const [identifier, definition] of parsed.definitions) {
            const existing = seenIdentifiers.get(identifier);

            if (existing) {
                const range = this.createRange(parsed.lines, definition.line - 1, definition.identifier);
                const diagnostic = new vscode.Diagnostic(
                    range,
                    `Duplicate identifier '${identifier}'. First defined at line ${existing.line}`,
                    vscode.DiagnosticSeverity.Error
                );
                diagnostic.code = 'duplicate-identifier';
                diagnostics.push(diagnostic);
            } else {
                seenIdentifiers.set(identifier, definition);
            }
        }

        return diagnostics;
    }

    /**
     * Check for references to undefined elements
     */
    private checkUndefinedReferences(
        parsed: ParsedDocument,
        allDefinitions: Map<string, ElementDefinition>
    ): vscode.Diagnostic[] {
        const diagnostics: vscode.Diagnostic[] = [];
        const definedIdentifiers = new Set(allDefinitions.keys());

        const specialIdentifiers = ['*', 'this', 'true', 'false'];
        specialIdentifiers.forEach(id => definedIdentifiers.add(id));

        for (const ref of parsed.references) {
            if (!definedIdentifiers.has(ref.identifier)) {
                const range = new vscode.Range(
                    new vscode.Position(ref.line - 1, ref.startOffset),
                    new vscode.Position(ref.line - 1, ref.endOffset)
                );

                const diagnostic = new vscode.Diagnostic(
                    range,
                    `Undefined identifier '${ref.identifier}'`,
                    vscode.DiagnosticSeverity.Error
                );
                diagnostic.code = 'undefined-identifier';
                diagnostics.push(diagnostic);
            }
        }

        return diagnostics;
    }

    /**
     * Check for common syntax errors
     */
    private checkSyntaxPatterns(document: vscode.TextDocument): vscode.Diagnostic[] {
        const diagnostics: vscode.Diagnostic[] = [];
        const lines = document.getText().split('\n');

        for (let lineNum = 0; lineNum < lines.length; lineNum++) {
            const line = lines[lineNum];
            const trimmed = line.trim();

            if (trimmed.startsWith('//') || trimmed.startsWith('#') || !trimmed) {
                continue;
            }

            const openCount = (line.match(/\{/g) || []).length;
            const closeCount = (line.match(/\}/g) || []).length;

            if (openCount > 0 || closeCount > 0) {
                // Could track brace balance across lines, but for now we'll do simpler checks
            }

            const quoteCount = (line.match(/"/g) || []).length;
            if (quoteCount % 2 !== 0 && !trimmed.includes('\\')) {
                // Odd number of quotes might indicate unclosed string
                // But this could be a false positive if there are escaped quotes
            }

            const invalidIdentMatch = trimmed.match(/=\s*([a-zA-Z_]\w*)\s*=\s*/);
            if (invalidIdentMatch) {
                const range = this.createRange(lines, lineNum, invalidIdentMatch[1], line.indexOf(invalidIdentMatch[1]));
                const diagnostic = new vscode.Diagnostic(
                    range,
                    'Invalid identifier pattern: double assignment detected',
                    vscode.DiagnosticSeverity.Warning
                );
                diagnostic.code = 'invalid-assignment';
                diagnostics.push(diagnostic);
            }
        }

        return diagnostics;
    }

    /**
     * Create a range for a word at a specific line
     */
    private createRange(lines: string[], line: number, word: string, offset: number = 0): vscode.Range {
        const lineText = lines[line] || '';
        const wordIndex = lineText.indexOf(word, offset);

        if (wordIndex >= 0) {
            return new vscode.Range(
                new vscode.Position(line, wordIndex),
                new vscode.Position(line, wordIndex + word.length)
            );
        }

        return new vscode.Range(
            new vscode.Position(line, 0),
            new vscode.Position(line, lineText.length)
        );
    }

    /**
     * Clear all diagnostics
     */
    clear(): void {
        this.diagnostics.clear();
    }

    /**
     * Dispose the diagnostic collection
     */
    dispose(): void {
        this.diagnostics.dispose();
    }
}
