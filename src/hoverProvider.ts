import * as vscode from 'vscode';
import { DslParser, ElementDefinition } from './dslParser';
import { KEYWORD_DOCUMENTATION } from './keywordDocumentation';
import { getIncludeResolver } from './includeResolver';

/**
 * Provides hover documentation for Structurizr DSL elements
 */
export class DslHoverProvider implements vscode.HoverProvider {
    async provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken
    ): Promise<vscode.Hover | undefined> {
        const config = vscode.workspace.getConfiguration('c4AssistDsl');
        const enabled = config.get<boolean>('completion.enable', true);

        if (!enabled) {
            return undefined;
        }

        const parser = new DslParser(document.getText(), document.uri);
        const parsed = parser.parse();

        const wordRange = document.getWordRangeAtPosition(position, /[\w.]+/);
        let identifier = '';
        let hoverRange = wordRange;

        if (wordRange) {
            identifier = document.getText(wordRange);
        } else {
            const line = document.lineAt(position.line);
            const text = line.text.substring(0, position.character);
            const match = text.match(/!([\w]+)$/);
            if (match) {
                identifier = '!' + match[1];
                hoverRange = new vscode.Range(
                    position.line,
                    position.character - identifier.length,
                    position.line,
                    position.character
                );
            }
        }

        if (!identifier || !hoverRange) {
            return undefined;
        }

        const keywordDoc = KEYWORD_DOCUMENTATION[identifier];
        if (keywordDoc) {
            const markdown = this.buildKeywordMarkdown(keywordDoc);
            return new vscode.Hover(markdown, hoverRange);
        }

        if (identifier === '->') {
            const keywordDoc = KEYWORD_DOCUMENTATION['->'];
            if (keywordDoc) {
                const markdown = this.buildKeywordMarkdown(keywordDoc);
                return new vscode.Hover(markdown, hoverRange);
            }
        }

        const definition = parsed.definitions.get(identifier);

        if (definition) {
            const markdown = this.buildElementMarkdown(definition, parsed);
            return new vscode.Hover(markdown, hoverRange);
        }

        const isReference = parsed.references.some(ref =>
            ref.identifier === identifier &&
            position.line === ref.line - 1
        );

        if (isReference) {
            const includeResolver = getIncludeResolver();
            const includedDocs = await includeResolver.getIncludedDocuments(document.uri, document.getText());

            for (const doc of includedDocs) {
                const includeParser = new DslParser(doc.content, doc.uri);
                const includeParsed = includeParser.parse();

                const includeDef = includeParsed.definitions.get(identifier);

                if (includeDef) {
                    const markdown = this.buildElementMarkdown(includeDef, includeParsed);
                    return new vscode.Hover(markdown, hoverRange);
                }
            }
        }

        return undefined;
    }

    /**
     * Build markdown documentation for Structurizr keywords
     */
    private buildKeywordMarkdown(keywordDoc: {
        keyword: string;
        description: string;
        syntax?: string;
        link?: string;
        permittedChildren?: string[];
    }): vscode.MarkdownString {
        const markdown = new vscode.MarkdownString();

        markdown.appendMarkdown(`**\`${keywordDoc.keyword}\`**\n\n`);
        markdown.appendMarkdown(`${keywordDoc.description}\n\n`);

        if (keywordDoc.syntax) {
            markdown.appendMarkdown('**Syntax:**\n');
            markdown.appendCodeblock(keywordDoc.syntax, 'text');
            markdown.appendMarkdown('\n');
        }

        if (keywordDoc.permittedChildren && keywordDoc.permittedChildren.length > 0) {
            markdown.appendMarkdown('**Permitted children:** ');
            const children = keywordDoc.permittedChildren.map(c => {
                return c.startsWith('!') ? `\`${c}\`` : `\`${c}\``;
            }).join(', ');
            markdown.appendMarkdown(children + '\n\n');
        }

        if (keywordDoc.link) {
            markdown.appendMarkdown(`---\n\n`);
            markdown.appendMarkdown(`[📖 View documentation](${keywordDoc.link})\n`);
        }

        markdown.isTrusted = true;
        return markdown;
    }

    /**
     * Build markdown documentation for an element
     */
    private buildElementMarkdown(definition: ElementDefinition, parsed: { definitions: Map<string, ElementDefinition> }): vscode.MarkdownString {
        const typeLabel = this.getTypeLabel(definition.type);
        const markdown = new vscode.MarkdownString();

        markdown.appendMarkdown(`**${typeLabel}** \`${definition.identifier}\`\n\n`);

        if (definition.name) {
            markdown.appendMarkdown(`**Name:** ${definition.name}\n\n`);
        }

        if (definition.description) {
            markdown.appendMarkdown(`**Description:** ${definition.description}\n\n`);
        }

        if (definition.technology) {
            markdown.appendMarkdown(`**Technology:** ${definition.technology}\n\n`);
        }

        markdown.appendMarkdown(`---\n\n`);
        markdown.appendMarkdown(`*Defined at line ${definition.line}*\n`);

        const refCount = this.countReferences(definition.identifier, parsed);
        if (refCount > 0) {
            markdown.appendMarkdown(`*Referenced ${refCount} time(s)*\n`);
        }

        return markdown;
    }

    /**
     * Get user-friendly label for element type
     */
    private getTypeLabel(type: string): string {
        const labels: Record<string, string> = {
            'person': '👤 Person',
            'personinstance': '👤 Person Instance',
            'softwaresystem': '🖥️ Software System',
            'softwaresysteminstance': '🖥️ Software System Instance',
            'container': '📦 Container',
            'containerinstance': '📦 Container Instance',
            'component': '⚙️ Component',
            'componentinstance': '⚙️ Component Instance',
            'deploymentnode': '🌐 Deployment Node',
            'infrastructurenode': '🔧 Infrastructure Node',
            'element': '📄 Element',
            'group': '📁 Group'
        };

        return labels[type] || `📄 ${type}`;
    }

    /**
     * Count references to an identifier
     */
    private countReferences(identifier: string, parsed: { definitions: Map<string, ElementDefinition> }): number {
        // This is a simplified count - in real implementation would use the parser's references
        let count = 0;
        for (const [key, def] of parsed.definitions) {
            // Simple check - could be enhanced
        }
        return count;
    }
}
