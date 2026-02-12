import * as vscode from 'vscode';
import { DslContextParser, ParsedContext } from './dslContext';
import {
    KEYWORDS_BY_CONTEXT,
    SHAPE_VALUES,
    AUTOLAYOUT_DIRECTIONS,
    BORDER_STYLES,
    ROUTING_STYLES,
    SCOPE_VALUES,
    VISIBILITY_VALUES,
    KeywordInfo
} from './dslData';
import { parseDocumentWithIncludes } from './workspaceIndex';

// ============================================================================
// Constants
// ============================================================================

const ELEMENT_TYPE_KEYWORDS = [
    'person', 'personInstance',
    'softwareSystem', 'softwareSystemInstance',
    'container', 'containerInstance',
    'component',
    'deploymentNode', 'infrastructureNode',
    'element'
] as const;

const KEYWORDS_AFTER_EQUALS = ['user', 'users', 'group', 'in', 'of'] as const;
const KEYWORDS_REQUIRING_IDENTIFIER = ['systemcontext', 'container', 'component', 'filtered', 'dynamic', 'deployment', 'image'] as const;
const KEYWORDS_WITH_BOOLEAN_VALUES = ['metadata', 'description', 'opacity'] as const;

const SPECIAL_IDENTIFIERS = ['*', 'this'] as const;
const COMMON_TAGS = ['Element', 'Person', 'Software System', 'Container', 'Component'] as const;

// ============================================================================
// Completion Item Factory
// ============================================================================

class CompletionItemFactory {
    createKeyword(keywordInfo: KeywordInfo): vscode.CompletionItem {
        const item = new vscode.CompletionItem(keywordInfo.keyword, vscode.CompletionItemKind.Keyword);
        item.detail = keywordInfo.detail;
        item.documentation = new vscode.MarkdownString(keywordInfo.description);
        item.insertText = keywordInfo.insertText || keywordInfo.keyword;
        item.sortText = `0_${keywordInfo.keyword}`;
        return item;
    }

    createElementType(type: string): vscode.CompletionItem {
        const item = new vscode.CompletionItem(type, vscode.CompletionItemKind.Class);
        item.detail = `Element type: ${type}`;
        item.documentation = new vscode.MarkdownString(`Reference to a ${type} element`);
        item.sortText = `0_${type}`;
        return item;
    }

    createEnumMember(value: string): vscode.CompletionItem {
        const item = new vscode.CompletionItem(value, vscode.CompletionItemKind.EnumMember);
        item.sortText = `1_${value}`;
        return item;
    }

    createConstant(name: string): vscode.CompletionItem {
        const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Constant);
        item.sortText = `0_${name}`;
        return item;
    }

    createReference(identifier: string, detail?: string): vscode.CompletionItem {
        const item = new vscode.CompletionItem(identifier, vscode.CompletionItemKind.Reference);
        if (detail) {
            item.detail = detail;
        }
        item.sortText = `2_${identifier}`;
        return item;
    }

    createValue(value: string): vscode.CompletionItem {
        const item = new vscode.CompletionItem(value, vscode.CompletionItemKind.Value);
        item.sortText = `1_${value}`;
        return item;
    }
}

// ============================================================================
// Main Completion Provider
// ============================================================================

export class DslCompletionProvider implements vscode.CompletionItemProvider {
    private readonly factory = new CompletionItemFactory();

    async provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken,
        _context: vscode.CompletionContext
    ): Promise<vscode.CompletionList | vscode.CompletionItem[]> {
        if (!this.isCompletionEnabled()) {
            return new vscode.CompletionList([], false);
        }

        const parseResult = this.parseDocumentContext(document, position);
        if (this.shouldSuppressCompletion(parseResult)) {
            return new vscode.CompletionList([], false);
        }

        const items = await this.buildCompletionItems(document, parseResult);
        return new vscode.CompletionList(items, false);
    }

    // ========================================================================
    // Context Parsing
    // ========================================================================

    private isCompletionEnabled(): boolean {
        const config = vscode.workspace.getConfiguration('c4AssistDsl');
        return config.get<boolean>('completion.enable', true);
    }

    private parseDocumentContext(document: vscode.TextDocument, position: vscode.Position) {
        const text = document.getText();
        const offset = document.offsetAt(position);
        const lineText = document.lineAt(position.line).text;
        const textBeforeCursor = lineText.substring(0, position.character);
        const isLineEmpty = /^\s*$/.test(textBeforeCursor);

        const parser = new DslContextParser(text, offset);
        const context = parser.getContext();
        const currentWord = DslContextParser.getCurrentWord(text, offset);

        return { text, offset, context, currentWord, isLineEmpty };
    }

    private shouldSuppressCompletion(parseResult: {
        isLineEmpty: boolean;
        currentWord: string;
        context: ParsedContext;
    }): boolean {
        const { isLineEmpty, currentWord, context } = parseResult;
        return isLineEmpty && !currentWord && !context.inStringLiteral && !context.inRelationship;
    }

    // ========================================================================
    // Items Building
    // ========================================================================

    private async buildCompletionItems(
        document: vscode.TextDocument,
        parseResult: { context: ParsedContext; currentWord: string; offset: number }
    ): Promise<vscode.CompletionItem[]> {
        const { context, currentWord, offset } = parseResult;
        const itemsMap = new Map<string, vscode.CompletionItem>();

        if (context.inStringLiteral) {
            return this.getStringCompletionItems(context, currentWord);
        }

        if (context.inRelationship) {
            return this.getElementCompletionItems(document, offset, currentWord);
        }

        this.addKeywordItems(itemsMap, context);
        this.addSpecialValueItems(itemsMap, context);

        await this.addIdentifierItems(itemsMap, context, document, currentWord);

        const items = Array.from(itemsMap.values());
        return this.filterByCurrentWord(items, currentWord);
    }

    private filterByCurrentWord(items: vscode.CompletionItem[], currentWord: string): vscode.CompletionItem[] {
        if (!currentWord) return items;
        return items.filter(item =>
            item.label.toString().toLowerCase().startsWith(currentWord.toLowerCase())
        );
    }

    // ========================================================================
    // Keyword Items
    // ========================================================================

    private addKeywordItems(itemsMap: Map<string, vscode.CompletionItem>, context: ParsedContext): void {
        const keywords = KEYWORDS_BY_CONTEXT[context.context] || [];

        for (const kw of keywords) {
            const item = this.factory.createKeyword(kw);
            itemsMap.set(kw.keyword, item);
        }

        if (this.isAfterEqualsSign(context)) {
            this.addElementTypeItems(itemsMap);
        }
    }

    private addElementTypeItems(itemsMap: Map<string, vscode.CompletionItem>): void {
        for (const type of ELEMENT_TYPE_KEYWORDS) {
            if (!itemsMap.has(type)) {
                itemsMap.set(type, this.factory.createElementType(type));
            }
        }
    }

    private isAfterEqualsSign(context: ParsedContext): boolean {
        const prevKeyword = context.previousKeyword?.toLowerCase();
        return prevKeyword !== undefined && KEYWORDS_AFTER_EQUALS.includes(prevKeyword as any);
    }

    // ========================================================================
    // Special Value Items
    // ========================================================================

    private addSpecialValueItems(itemsMap: Map<string, vscode.CompletionItem>, context: ParsedContext): void {
        const prevKeyword = context.previousKeyword?.toLowerCase();
        if (!prevKeyword) return;

        this.addValueProviders(itemsMap, prevKeyword);
        this.addBooleanValues(itemsMap, prevKeyword);
    }

    private addValueProviders(itemsMap: Map<string, vscode.CompletionItem>, prevKeyword: string): void {
        const valueMap: Record<string, readonly string[]> = {
            'shape': SHAPE_VALUES,
            'autolayout': AUTOLAYOUT_DIRECTIONS,
            'border': BORDER_STYLES,
            'routing': ROUTING_STYLES,
            'scope': SCOPE_VALUES,
            'visibility': VISIBILITY_VALUES
        };

        const values = valueMap[prevKeyword];
        if (values) {
            for (const value of values) {
                itemsMap.set(value, this.factory.createEnumMember(value));
            }
        }
    }

    private addBooleanValues(itemsMap: Map<string, vscode.CompletionItem>, prevKeyword: string): void {
        if (KEYWORDS_WITH_BOOLEAN_VALUES.includes(prevKeyword as any)) {
            itemsMap.set('true', this.factory.createValue('true'));
            itemsMap.set('false', this.factory.createValue('false'));
        }
    }

    // ========================================================================
    // Identifier Items
    // ========================================================================

    private async addIdentifierItems(
        itemsMap: Map<string, vscode.CompletionItem>,
        context: ParsedContext,
        document: vscode.TextDocument,
        currentWord: string
    ): Promise<void> {
        if (!this.requiresIdentifier(context)) return;

        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) return;

        const offset = document.offsetAt(activeEditor.selection.active);
        const identifierItems = await this.getElementCompletionItems(document, offset, currentWord);

        for (const item of identifierItems) {
            const label = item.label.toString();
            if (!itemsMap.has(label)) {
                itemsMap.set(label, item);
            }
        }
    }

    private requiresIdentifier(context: ParsedContext): boolean {
        const prevKeyword = context.previousKeyword?.toLowerCase();
        return prevKeyword !== undefined && KEYWORDS_REQUIRING_IDENTIFIER.includes(prevKeyword as any);
    }

    // ========================================================================
    // Element Completion
    // ========================================================================

    private async getElementCompletionItems(
        document: vscode.TextDocument,
        _offset: number,
        currentWord: string
    ): Promise<vscode.CompletionItem[]> {
        const itemsMap = new Map<string, vscode.CompletionItem>();

        // Add special identifiers
        for (const id of SPECIAL_IDENTIFIERS) {
            itemsMap.set(id, this.factory.createConstant(id));
        }

        // Add identifiers from document and all includes via centralized parser
        const { allDefinitions } = await parseDocumentWithIncludes(document);
        for (const [identifier, definition] of allDefinitions) {
            if (!itemsMap.has(identifier)) {
                const detail = definition.sourceUri && definition.sourceUri.fsPath !== document.uri.fsPath
                    ? `${definition.type} (from ${definition.sourceUri.fsPath})`
                    : undefined;
                itemsMap.set(identifier, this.factory.createReference(identifier, detail));
            }
        }

        const items = Array.from(itemsMap.values());
        return this.filterByCurrentWord(items, currentWord);
    }

    // ========================================================================
    // String Completion
    // ========================================================================

    private getStringCompletionItems(context: ParsedContext, currentWord: string): vscode.CompletionItem[] {
        const items: vscode.CompletionItem[] = [];
        const prevKeyword = context.previousKeyword?.toLowerCase();

        if (prevKeyword === 'url') {
            items.push(this.factory.createValue('https://'));
        }

        if (prevKeyword === 'tags' || prevKeyword === 'tag') {
            for (const tag of COMMON_TAGS) {
                items.push(this.factory.createEnumMember(tag));
            }
        }

        return this.filterByCurrentWord(items, currentWord);
    }
}
