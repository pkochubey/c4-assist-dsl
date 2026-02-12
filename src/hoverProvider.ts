import * as vscode from 'vscode';
import { ElementDefinition } from './dslParser';
import { KEYWORD_DOCUMENTATION } from './keywordDocumentation';
import { parseDocumentWithIncludes } from './workspaceIndex';

/**
 * Provides hover documentation for Structurizr DSL elements
 */
export class DslHoverProvider implements vscode.HoverProvider {
    async provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken
    ): Promise<vscode.Hover | undefined> {
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
            const arrowDoc = KEYWORD_DOCUMENTATION['->'];
            if (arrowDoc) {
                const markdown = this.buildKeywordMarkdown(arrowDoc);
                return new vscode.Hover(markdown, hoverRange);
            }
        }

        const { allDefinitions } = await parseDocumentWithIncludes(document);
        const definition = allDefinitions.get(identifier);

        if (definition) {
            const markdown = this.buildElementMarkdown(definition);
            return new vscode.Hover(markdown, hoverRange);
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
            const children = keywordDoc.permittedChildren.map(c => `\`${c}\``).join(', ');
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
    private buildElementMarkdown(definition: ElementDefinition): vscode.MarkdownString {
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
}
