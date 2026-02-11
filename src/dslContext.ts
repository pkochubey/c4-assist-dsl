import {
    ContextType,
    KEYWORDS_BY_CONTEXT,
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

/**
 * Parse DSL text to determine the context at a given position
 */
export class DslContextParser {
    private text: string;
    private position: number;

    constructor(text: string, position: number) {
        this.text = text;
        this.position = position;
    }

    /**
     * Get the context at the current position
     */
    getContext(): ParsedContext {
        const textBeforePosition = this.text.substring(0, this.position);

        if (this.isInStringLiteral(textBeforePosition)) {
            return {
                context: ContextType.Global,
                blockLevel: 0,
                inRelationship: false,
                inStringLiteral: true,
                identifierStack: []
            };
        }

        const parsed = this.parseTextBeforePosition(textBeforePosition);
        return parsed;
    }

    /**
     * Check if position is inside a string literal
     */
    private isInStringLiteral(text: string): boolean {
        let inString = false;
        let escapeNext = false;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];

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

    /**
     * Parse text before cursor position
     */
    private parseTextBeforePosition(text: string): ParsedContext {
        const tokens = this.tokenize(text);
        const stack: { context: ContextType; keyword: string }[] = [];
        let blockLevel = 0;
        let inRelationship = false;
        let previousKeyword: string | undefined;

        stack.push({ context: ContextType.Global, keyword: '' });

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            const prevToken = i > 0 ? tokens[i - 1] : '';

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
                if (token.startsWith('!')) {
                    previousKeyword = token;
                } else {
                    previousKeyword = token;
                    if (this.isViewKeyword(token)) {
                    }
                }
                inRelationship = false;
            }
        }

        const currentContext = stack[stack.length - 1].context;

        return {
            context: currentContext,
            blockLevel,
            inRelationship,
            inStringLiteral: false,
            previousKeyword,
            identifierStack: stack.map(s => s.keyword)
        };
    }

    /**
     * Tokenize DSL text
     */
    private tokenize(text: string): string[] {
        text = this.removeComments(text);

        const tokens: string[] = [];
        let current = '';
        let inString = false;
        let escapeNext = false;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];

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

            if (char === '-' && i + 1 < text.length && text[i + 1] === '>') {
                if (current.trim()) {
                    tokens.push(current.trim());
                    current = '';
                }
                tokens.push('->');
                i++;
                continue;
            }

            if (char === '{' || char === '}' || char === '=') {
                if (current.trim()) {
                    tokens.push(current.trim());
                    current = '';
                }
                tokens.push(char);
                continue;
            }

            if (/\s/.test(char)) {
                if (current.trim()) {
                    tokens.push(current.trim());
                    current = '';
                }
                continue;
            }

            current += char;
        }

        if (current.trim()) {
            tokens.push(current.trim());
        }

        return tokens;
    }

    /**
     * Remove comments from text
     */
    private removeComments(text: string): string {
        text = text.replace(/\/\*[\s\S]*?\*\//g, '');
        text = text.replace(/#[^\n]*/g, '');
        text = text.replace(/\/\/[^\n]*/g, '');
        return text;
    }

    /**
     * Check if token is a keyword
     */
    private isKeyword(token: string): boolean {
        if (!token) return false;
        if (token.startsWith('!')) return true;
        return ALL_KEYWORDS.has(token.toLowerCase());
    }

    /**
     * Check if token is a view keyword
     */
    private isViewKeyword(token: string): boolean {
        const viewKeywords = [
            'systemLandscape', 'systemContext', 'container',
            'component', 'filtered', 'dynamic', 'deployment', 'custom', 'image'
        ];
        return viewKeywords.includes(token);
    }

    /**
     * Get context type from keyword and parent context
     */
    private getContextFromKeyword(keyword: string, parentContext: ContextType): ContextType {
        const lowerKeyword = keyword.toLowerCase();

        if (lowerKeyword.startsWith('!')) {
            return parentContext;
        }

        const keywordContextMap: Record<string, ContextType> = {
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

        if (parentContext === ContextType.Views) {
            if (lowerKeyword === 'container') return ContextType.ContainerView;
            if (lowerKeyword === 'component') return ContextType.ComponentView;
        }

        return keywordContextMap[lowerKeyword] || parentContext;
    }

    /**
     * Get current word being typed (for filtering)
     */
    static getCurrentWord(text: string, position: number): string {
        const textBeforePosition = text.substring(0, position);
        const match = textBeforePosition.match(/[\w!]+$/);
        return match ? match[0] : '';
    }
}
