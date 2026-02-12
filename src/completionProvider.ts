import * as vscode from 'vscode';
import { DslContextParser, ParsedContext } from './dslContext';
import { DslParser } from './dslParser';
import {
    KEYWORDS_BY_CONTEXT,
    SHAPE_VALUES,
    AUTOLAYOUT_DIRECTIONS,
    BORDER_STYLES,
    ROUTING_STYLES,
    SCOPE_VALUES,
    VISIBILITY_VALUES,
} from './dslData';
import { getIncludeResolver } from './includeResolver';

export class DslCompletionProvider implements vscode.CompletionItemProvider {

    async provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken,
        _context: vscode.CompletionContext
    ): Promise<vscode.CompletionItem[]> {
        const config = vscode.workspace.getConfiguration('c4AssistDsl');
        const enabled = config.get<boolean>('completion.enable', true);

        if (!enabled) {
            return [];
        }

        const text = document.getText();
        const offset = document.offsetAt(position);

        const parser = new DslContextParser(text, offset);
        const parsedContext = parser.getContext();
        const currentWord = DslContextParser.getCurrentWord(text, offset);

        if (parsedContext.inStringLiteral) {
            return this.getStringCompletion(parsedContext, currentWord);
        }

        if (parsedContext.inRelationship) {
            return await this.getElementIdentifierCompletion(document, offset, currentWord);
        }

        return await this.getKeywordCompletion(parsedContext, currentWord, document);
    }

    private async getKeywordCompletion(
        parsedContext: ParsedContext,
        currentWord: string,
        document: vscode.TextDocument
    ): Promise<vscode.CompletionItem[]> {
        const items: vscode.CompletionItem[] = [];
        const keywords = KEYWORDS_BY_CONTEXT[parsedContext.context] || [];

        for (const kw of keywords) {
            const item = new vscode.CompletionItem(kw.keyword, vscode.CompletionItemKind.Keyword);
            item.detail = kw.detail;
            item.documentation = new vscode.MarkdownString(kw.description);
            item.insertText = kw.insertText || kw.keyword;
            item.sortText = `0_${kw.keyword}`;
            items.push(item);
        }

        items.push(...this.getSpecialValueCompletions(parsedContext));

        if (this.requiresIdentifier(parsedContext)) {
            const identifierItems = await this.getElementIdentifierCompletion(document, document.offsetAt(vscode.window.activeTextEditor!.selection.active), currentWord);
            items.push(...identifierItems);
        }

        if (currentWord) {
            return items.filter(item =>
                item.label.toString().toLowerCase().startsWith(currentWord.toLowerCase())
            );
        }

        return items;
    }

    private getSpecialValueCompletions(parsedContext: ParsedContext): vscode.CompletionItem[] {
        const items: vscode.CompletionItem[] = [];
        const previousKeyword = parsedContext.previousKeyword?.toLowerCase();

        if (previousKeyword === 'shape') {
            for (const shape of SHAPE_VALUES) {
                const item = new vscode.CompletionItem(shape, vscode.CompletionItemKind.EnumMember);
                item.sortText = `1_${shape}`;
                items.push(item);
            }
        }

        if (previousKeyword === 'autolayout') {
            for (const dir of AUTOLAYOUT_DIRECTIONS) {
                const item = new vscode.CompletionItem(dir, vscode.CompletionItemKind.EnumMember);
                item.sortText = `1_${dir}`;
                items.push(item);
            }
        }

        if (previousKeyword === 'border') {
            for (const style of BORDER_STYLES) {
                const item = new vscode.CompletionItem(style, vscode.CompletionItemKind.EnumMember);
                item.sortText = `1_${style}`;
                items.push(item);
            }
        }

        if (previousKeyword === 'routing') {
            for (const style of ROUTING_STYLES) {
                const item = new vscode.CompletionItem(style, vscode.CompletionItemKind.EnumMember);
                item.sortText = `1_${style}`;
                items.push(item);
            }
        }

        if (previousKeyword === 'scope') {
            for (const scope of SCOPE_VALUES) {
                const item = new vscode.CompletionItem(scope, vscode.CompletionItemKind.EnumMember);
                item.sortText = `1_${scope}`;
                items.push(item);
            }
        }

        if (previousKeyword === 'visibility') {
            for (const vis of VISIBILITY_VALUES) {
                const item = new vscode.CompletionItem(vis, vscode.CompletionItemKind.EnumMember);
                item.sortText = `1_${vis}`;
                items.push(item);
            }
        }

        const booleanKeywords = ['metadata', 'description', 'opacity'];
        if (previousKeyword && booleanKeywords.includes(previousKeyword)) {
            const itemTrue = new vscode.CompletionItem('true', vscode.CompletionItemKind.Value);
            const itemFalse = new vscode.CompletionItem('false', vscode.CompletionItemKind.Value);
            itemTrue.sortText = '1_true';
            itemFalse.sortText = '1_false';
            items.push(itemTrue, itemFalse);
        }

        return items;
    }

    private requiresIdentifier(parsedContext: ParsedContext): boolean {
        const previousKeyword = parsedContext.previousKeyword?.toLowerCase();

        const identifierKeywords = [
            'systemcontext', 'container', 'component', 'filtered',
            'dynamic', 'deployment', 'image'
        ];

        if (previousKeyword && identifierKeywords.includes(previousKeyword)) {
            return true;
        }

        return false;
    }

    private async getElementIdentifierCompletion(
        document: vscode.TextDocument,
        offset: number,
        currentWord: string
    ): Promise<vscode.CompletionItem[]> {
        const items: vscode.CompletionItem[] = [];
        const text = document.getText();

        const patterns = [
            /person\s+(\w+)/gi,
            /softwaresystem\s+(\w+)/gi,
            /container\s+(\w+)/gi,
            /component\s+(\w+)/gi,
            /deploymentnode\s+(\w+)/gi,
            /infrastructurenode\s+(\w+)/gi,
            /element\s+(\w+)/gi,
        ];

        const identifiers = new Set<string>();

        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                if (match[1]) {
                    identifiers.add(match[1]);
                }
            }
        }

        const includeResolver = getIncludeResolver();
        const includedDocs = await includeResolver.getIncludedDocuments(document.uri, text);

        for (const doc of includedDocs) {
            const parser = new DslParser(doc.content, doc.uri);
            const parsed = parser.parse();

            for (const [identifier, definition] of parsed.definitions) {
                identifiers.add(identifier);
                const item = new vscode.CompletionItem(identifier, vscode.CompletionItemKind.Reference);
                item.detail = `${definition.type} (from ${doc.uri.fsPath})`;
                item.sortText = `2_${identifier}`;
                items.push(item);
            }
        }

        for (const id of identifiers) {
            const existingItem = items.find(item => item.label === id);
            if (!existingItem) {
                const item = new vscode.CompletionItem(id, vscode.CompletionItemKind.Reference);
                item.sortText = `2_${id}`;
                items.push(item);
            }
        }

        const specialIds = ['*', 'this'];
        for (const specialId of specialIds) {
            const item = new vscode.CompletionItem(specialId, vscode.CompletionItemKind.Constant);
            item.sortText = `0_${specialId}`;
            items.push(item);
        }

        if (currentWord) {
            return items.filter(item =>
                item.label.toString().toLowerCase().startsWith(currentWord.toLowerCase())
            );
        }

        return items;
    }

    private getStringCompletion(parsedContext: ParsedContext, currentWord: string): vscode.CompletionItem[] {
        const items: vscode.CompletionItem[] = [];
        const previousKeyword = parsedContext.previousKeyword?.toLowerCase();

        if (previousKeyword === 'url') {
            const http = new vscode.CompletionItem('https://', vscode.CompletionItemKind.Value);
            items.push(http);
        }

        if (previousKeyword === 'tags' || previousKeyword === 'tag') {
            const commonTags = ['Element', 'Person', 'Software System', 'Container', 'Component'];
            for (const tag of commonTags) {
                const item = new vscode.CompletionItem(tag, vscode.CompletionItemKind.EnumMember);
                items.push(item);
            }
        }

        return items;
    }
}
