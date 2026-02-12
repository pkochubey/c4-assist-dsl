import * as vscode from 'vscode';

/**
 * Provides document formatting for Structurizr DSL
 */
export class DslFormatterProvider implements vscode.DocumentFormattingEditProvider, vscode.DocumentRangeFormattingEditProvider {

    async provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions,
        _token: vscode.CancellationToken
    ): Promise<vscode.TextEdit[]> {
        return this.formatDocument(document, options);
    }

    async provideDocumentRangeFormattingEdits(
        document: vscode.TextDocument,
        range: vscode.Range,
        options: vscode.FormattingOptions,
        _token: vscode.CancellationToken
    ): Promise<vscode.TextEdit[]> {
        const fullEdits = this.formatDocument(document, options);

        return fullEdits.filter(edit => {
            const editRange = edit.range;
            return editRange.intersection(range) !== undefined;
        });
    }

    private formatDocument(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions
    ): vscode.TextEdit[] {
        const edits: vscode.TextEdit[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        const indentSize = options.insertSpaces ? options.tabSize : 1;
        const useSpaces = options.insertSpaces;
        const indentChar = useSpaces ? ' ' : '\t';

        const formatted: string[] = [];
        let inMultilineString = false;
        let braceDepth = 0;

        for (let i = 0; i < lines.length; i++) {
            const originalLine = lines[i];
            const trimmed = originalLine.trim();

            if (!trimmed) {
                formatted.push('');
                continue;
            }

            if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*')) {
                formatted.push(this.indentLine(trimmed, braceDepth, indentChar, indentSize));
                continue;
            }

            if (trimmed.includes('"')) {
                const quoteCount = (trimmed.match(/"/g) || []).length;
                if (quoteCount % 2 !== 0) {
                    inMultilineString = !inMultilineString;
                }
            }

            if (inMultilineString) {
                formatted.push(originalLine);
                continue;
            }

            let lineDepth = braceDepth;

            const firstNonSpace = trimmed.search(/\S/);
            if (firstNonSpace >= 0 && trimmed[firstNonSpace] === '}') {
                lineDepth = Math.max(0, braceDepth - 1);
            }

            const formattedLine = this.formatLine(trimmed, lineDepth, indentChar, indentSize);
            formatted.push(formattedLine);

            const openBraces = (trimmed.match(/\{/g) || []).length;
            const closeBraces = (trimmed.match(/\}/g) || []).length;

            braceDepth += openBraces - closeBraces;
            braceDepth = Math.max(0, braceDepth);
        }

        const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(text.length)
        );

        edits.push(vscode.TextEdit.replace(fullRange, formatted.join('\n')));

        return edits;
    }

    /**
     * Format a single line with proper indentation
     */
    private formatLine(
        line: string,
        depth: number,
        indentChar: string,
        indentSize: number
    ): string {
        const indent = indentChar.repeat(depth * indentSize);

        let formatted = line.replace(/\s+/g, ' ');

        // Format -> but don't add leading space if line starts with ->
        if (formatted.startsWith('->')) {
            formatted = '->' + formatted.substring(2).replace(/^\s+/, ' ');
        } else {
            formatted = formatted.replace(/\s*->\s*/g, ' -> ');
        }

        formatted = formatted.replace(/\s*=\s*/g, ' = ');
        formatted = formatted.replace(/\{\s+/, '{ ');
        formatted = formatted.replace(/\s+\}/g, ' }');

        return indent + formatted;
    }

    /**
     * Indent a line to a specific depth
     */
    private indentLine(
        line: string,
        depth: number,
        indentChar: string,
        indentSize: number
    ): string {
        const indent = indentChar.repeat(depth * indentSize);
        return indent + line.trim();
    }
}
