import { DslContextParser } from './dslContext';
import { ContextType } from './dslData';

describe('DslContextParser', () => {
    // ========================================================================
    // Global Context
    // ========================================================================

    describe('global context', () => {
        it('should return Global for empty text', () => {
            const parser = new DslContextParser('', 0);
            const ctx = parser.getContext();

            expect(ctx.context).toBe(ContextType.Global);
            expect(ctx.blockLevel).toBe(0);
        });

        it('should return Global before workspace keyword', () => {
            const text = 'work';
            const parser = new DslContextParser(text, text.length);
            const ctx = parser.getContext();

            expect(ctx.context).toBe(ContextType.Global);
        });
    });

    // ========================================================================
    // Workspace Context
    // ========================================================================

    describe('workspace context', () => {
        it('should detect Workspace inside workspace block', () => {
            const text = 'workspace "Test" {\n    ';
            const parser = new DslContextParser(text, text.length);
            const ctx = parser.getContext();

            expect(ctx.context).toBe(ContextType.Workspace);
            expect(ctx.blockLevel).toBe(1);
        });
    });

    // ========================================================================
    // Model Context
    // ========================================================================

    describe('model context', () => {
        it('should detect Model inside model block', () => {
            const text = 'workspace {\n    model {\n        ';
            const parser = new DslContextParser(text, text.length);
            const ctx = parser.getContext();

            expect(ctx.context).toBe(ContextType.Model);
            expect(ctx.blockLevel).toBe(2);
        });
    });

    // ========================================================================
    // Element Contexts
    // ========================================================================

    describe('element contexts', () => {
        it('should detect Person context', () => {
            const text = 'workspace {\n    model {\n        user = person "User" {\n            ';
            const parser = new DslContextParser(text, text.length);
            const ctx = parser.getContext();

            expect(ctx.context).toBe(ContextType.Person);
        });

        it('should detect SoftwareSystem context', () => {
            const text = 'workspace {\n    model {\n        sys = softwareSystem "Sys" {\n            ';
            const parser = new DslContextParser(text, text.length);
            const ctx = parser.getContext();

            expect(ctx.context).toBe(ContextType.SoftwareSystem);
        });

        it('should detect Container context', () => {
            const text = 'workspace {\n    model {\n        sys = softwareSystem "Sys" {\n            web = container "Web" {\n                ';
            const parser = new DslContextParser(text, text.length);
            const ctx = parser.getContext();

            expect(ctx.context).toBe(ContextType.Container);
        });
    });

    // ========================================================================
    // Views Context
    // ========================================================================

    describe('views context', () => {
        it('should detect Views context', () => {
            const text = 'workspace {\n    views {\n        ';
            const parser = new DslContextParser(text, text.length);
            const ctx = parser.getContext();

            expect(ctx.context).toBe(ContextType.Views);
        });

        it('should detect SystemContextView inside views', () => {
            const text = 'workspace {\n    views {\n        systemContext sys {\n            ';
            const parser = new DslContextParser(text, text.length);
            const ctx = parser.getContext();

            expect(ctx.context).toBe(ContextType.SystemContextView);
        });

        it('should detect ContainerView inside views', () => {
            const text = 'workspace {\n    views {\n        container sys {\n            ';
            const parser = new DslContextParser(text, text.length);
            const ctx = parser.getContext();

            expect(ctx.context).toBe(ContextType.ContainerView);
        });

        it('should detect ComponentView inside views', () => {
            const text = 'workspace {\n    views {\n        component web {\n            ';
            const parser = new DslContextParser(text, text.length);
            const ctx = parser.getContext();

            expect(ctx.context).toBe(ContextType.ComponentView);
        });
    });

    // ========================================================================
    // Styles Context
    // ========================================================================

    describe('styles context', () => {
        it('should detect Styles context', () => {
            const text = 'workspace {\n    views {\n        styles {\n            ';
            const parser = new DslContextParser(text, text.length);
            const ctx = parser.getContext();

            expect(ctx.context).toBe(ContextType.Styles);
        });
    });

    // ========================================================================
    // Relationship Detection
    // ========================================================================

    describe('relationship detection', () => {
        it('should detect relationship context after ->', () => {
            const text = 'workspace {\n    model {\n        user -> ';
            const parser = new DslContextParser(text, text.length);
            const ctx = parser.getContext();

            expect(ctx.inRelationship).toBe(true);
        });

        it('should not detect relationship without ->', () => {
            const text = 'workspace {\n    model {\n        user = person ';
            const parser = new DslContextParser(text, text.length);
            const ctx = parser.getContext();

            expect(ctx.inRelationship).toBe(false);
        });
    });

    // ========================================================================
    // String Literal Detection
    // ========================================================================

    describe('string literal detection', () => {
        it('should detect cursor inside string literal', () => {
            const text = 'user = person "Us';
            const parser = new DslContextParser(text, text.length);
            const ctx = parser.getContext();

            expect(ctx.inStringLiteral).toBe(true);
        });

        it('should not detect cursor outside string literal', () => {
            const text = 'user = person "User" ';
            const parser = new DslContextParser(text, text.length);
            const ctx = parser.getContext();

            expect(ctx.inStringLiteral).toBe(false);
        });

        it('should handle escaped quotes', () => {
            const text = 'user = person "User \\"Name';
            const parser = new DslContextParser(text, text.length);
            const ctx = parser.getContext();

            expect(ctx.inStringLiteral).toBe(true);
        });
    });

    // ========================================================================
    // Block Level Tracking
    // ========================================================================

    describe('block level', () => {
        it('should track nested braces', () => {
            const text = 'workspace {\n    model {\n        person "User" {\n            ';
            const parser = new DslContextParser(text, text.length);
            const ctx = parser.getContext();

            expect(ctx.blockLevel).toBe(3);
        });

        it('should decrease level on closing brace', () => {
            const text = 'workspace {\n    model {\n    }\n    ';
            const parser = new DslContextParser(text, text.length);
            const ctx = parser.getContext();

            expect(ctx.blockLevel).toBe(1);
            expect(ctx.context).toBe(ContextType.Workspace);
        });

        it('should not go below zero', () => {
            const text = '}\n}\n}\n';
            const parser = new DslContextParser(text, text.length);
            const ctx = parser.getContext();

            expect(ctx.blockLevel).toBe(0);
        });
    });

    // ========================================================================
    // Comment Handling
    // ========================================================================

    describe('comment handling', () => {
        it('should ignore single-line // comments', () => {
            const text = 'workspace {\n    // model {\n    model {\n        ';
            const parser = new DslContextParser(text, text.length);
            const ctx = parser.getContext();

            expect(ctx.context).toBe(ContextType.Model);
        });

        it('should ignore single-line # comments', () => {
            const text = 'workspace {\n    # model {\n    model {\n        ';
            const parser = new DslContextParser(text, text.length);
            const ctx = parser.getContext();

            expect(ctx.context).toBe(ContextType.Model);
        });
    });

    // ========================================================================
    // getCurrentWord
    // ========================================================================

    describe('getCurrentWord', () => {
        it('should get current word at position', () => {
            const text = 'workspace {\n    soft';
            const word = DslContextParser.getCurrentWord(text, text.length);

            expect(word).toBe('soft');
        });

        it('should return empty for whitespace position', () => {
            const text = 'workspace { ';
            const word = DslContextParser.getCurrentWord(text, text.length);

            expect(word).toBe('');
        });

        it('should handle ! prefix keywords', () => {
            const text = 'workspace {\n    !incl';
            const word = DslContextParser.getCurrentWord(text, text.length);

            expect(word).toBe('!incl');
        });
    });
});
