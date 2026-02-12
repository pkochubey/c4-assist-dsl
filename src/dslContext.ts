import {
    ContextType,
    ALL_KEYWORDS
} from './dslData';

export interface ParsedContext {
    context: ContextType;
    blockLevel: number;
    inRelationship: boolean;
    inStringLiteral: boolean;
    previousKeyword?: string;
    identifierStack: string[];
}

interface StackFrame {
    context: ContextType;
    keyword: string;
}

// ============================================================================
// Keyword to Context Mapping
// ============================================================================

const KEYWORD_CONTEXT_MAP: Record<string, ContextType> = {
    'workspace': ContextType.Workspace,
    'model': ContextType.Model,
    'views': ContextType.Views,
    'person': ContextType.Person,
    'personinstance': ContextType.Person,
    'softwaresystem': ContextType.SoftwareSystem,
    'softwaresysteminstance': ContextType.SoftwareSystemInstance,
    'container': ContextType.Container,
    'containerinstance': ContextType.ContainerInstance,
    'component': ContextType.Component,
    'deploymentenvironment': ContextType.DeploymentEnvironment,
    'deploymentnode': ContextType.DeploymentNode,
    'infrastructurenode': ContextType.DeploymentNode,
    'configuration': ContextType.Configuration,
    'styles': ContextType.Styles,
    'element': ContextType.ElementStyle,
    'relationship': ContextType.RelationshipStyle,
    'group': ContextType.Group,
    'properties': ContextType.Properties,
    'perspectives': ContextType.Perspectives,
    'systemlandscape': ContextType.SystemLandscapeView,
    'systemcontext': ContextType.SystemContextView,
    'filtered': ContextType.FilteredView,
    'dynamic': ContextType.DynamicView,
    'deployment': ContextType.DeploymentView,
    'custom': ContextType.CustomView,
    'image': ContextType.CustomView,
    'branding': ContextType.Configuration,
    'terminology': ContextType.Configuration,
    'archetypes': ContextType.Model,
    'users': ContextType.Configuration,
    'animation': ContextType.SystemLandscapeView,
};

// ============================================================================
// DSL Context Parser
// ============================================================================

export class DslContextParser {
    constructor(private readonly text: string, private readonly position: number) {}

    getContext(): ParsedContext {
        const textBeforePosition = this.text.substring(0, this.position);

        if (this.isInStringLiteral(textBeforePosition)) {
            return this.createContext(ContextType.Global, 0, false, true, []);
        }

        return this.parseTextContext(textBeforePosition);
    }

    private createContext(
        context: ContextType,
        blockLevel: number,
        inRelationship: boolean,
        inStringLiteral: boolean,
        identifierStack: string[],
        previousKeyword?: string
    ): ParsedContext {
        return {
            context,
            blockLevel,
            inRelationship,
            inStringLiteral,
            previousKeyword,
            identifierStack
        };
    }

    // ========================================================================
    // String Literal Detection
    // ========================================================================

    private isInStringLiteral(text: string): boolean {
        let inString = false;
        let escapeNext = false;

        for (const char of text) {
            if (escapeNext) {
                escapeNext = false;
                continue;
            }

            if (char === '\\') {
                escapeNext = true;
                continue;
            }

            if (char === '"') {
                inString = !inString;
            }
        }

        return inString;
    }

    // ========================================================================
    // Text Context Parsing
    // ========================================================================

    private parseTextContext(text: string): ParsedContext {
        const tokens = this.tokenize(text);
        const stack: StackFrame[] = [{ context: ContextType.Global, keyword: '' }];
        let blockLevel = 0;
        let inRelationship = false;
        let previousKeyword: string | undefined;

        for (const token of tokens) {
            if (token === '{') {
                blockLevel++;
                if (previousKeyword) {
                    const newContext = this.getContextFromKeyword(previousKeyword, stack[stack.length - 1].context);
                    stack.push({ context: newContext, keyword: previousKeyword });
                }
            } else if (token === '}') {
                blockLevel = Math.max(0, blockLevel - 1);
                if (stack.length > 1) {
                    stack.pop();
                    previousKeyword = stack[stack.length - 1].keyword;
                }
            } else if (token === '->') {
                inRelationship = true;
            } else if (this.isKeyword(token)) {
                previousKeyword = token;
                inRelationship = false;
            }
        }

        const currentContext = stack[stack.length - 1].context;
        return this.createContext(
            currentContext,
            blockLevel,
            inRelationship,
            false,
            stack.map(s => s.keyword),
            previousKeyword
        );
    }

    // ========================================================================
    // Tokenization
    // ========================================================================

    private tokenize(text: string): string[] {
        const withoutComments = this.removeComments(text);
        const tokens: string[] = [];
        let current = '';
        let inString = false;
        let escapeNext = false;

        for (let i = 0; i < withoutComments.length; i++) {
            const char = withoutComments[i];
            const nextChar = withoutComments[i + 1];

            if (escapeNext) {
                current += char;
                escapeNext = false;
                continue;
            }

            if (char === '\\' && inString) {
                current += char;
                escapeNext = true;
                continue;
            }

            if (char === '"') {
                inString = !inString;
                current += char;
                continue;
            }

            if (inString) {
                current += char;
                continue;
            }

            // Handle arrow token '->'
            if (char === '-' && nextChar === '>') {
                this.flushToken(tokens, current);
                tokens.push('->');
                i++; // Skip '>'
                current = '';
                continue;
            }

            // Handle special single-char tokens
            if (this.isSpecialToken(char)) {
                this.flushToken(tokens, current);
                tokens.push(char);
                current = '';
                continue;
            }

            // Handle whitespace
            if (this.isWhitespace(char)) {
                this.flushToken(tokens, current);
                current = '';
                continue;
            }

            current += char;
        }

        this.flushToken(tokens, current);
        return tokens;
    }

    private flushToken(tokens: string[], current: string): void {
        const trimmed = current.trim();
        if (trimmed) {
            tokens.push(trimmed);
        }
    }

    private isSpecialToken(char: string): boolean {
        return ['{', '}', '='].includes(char);
    }

    private isWhitespace(char: string): boolean {
        return /\s/.test(char);
    }

    private removeComments(text: string): string {
        return text
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/#[^\n]*/g, '')
            .replace(/\/\/[^\n]*/g, '');
    }

    // ========================================================================
    // Keyword Utilities
    // ========================================================================

    private isKeyword(token: string): boolean {
        if (!token) return false;
        if (token.startsWith('!')) return true;
        return ALL_KEYWORDS.has(token.toLowerCase());
    }

    private getContextFromKeyword(keyword: string, parentContext: ContextType): ContextType {
        const lowerKeyword = keyword.toLowerCase();

        if (lowerKeyword.startsWith('!')) {
            return parentContext;
        }

        // Special handling for Views context
        if (parentContext === ContextType.Views) {
            if (lowerKeyword === 'container') return ContextType.ContainerView;
            if (lowerKeyword === 'component') return ContextType.ComponentView;
        }

        return KEYWORD_CONTEXT_MAP[lowerKeyword] ?? parentContext;
    }

    // ========================================================================
    // Static Utilities
    // ========================================================================

    static getCurrentWord(text: string, position: number): string {
        const textBeforePosition = text.substring(0, position);
        const match = textBeforePosition.match(/[\w!]+$/);
        return match ? match[0] : '';
    }
}
