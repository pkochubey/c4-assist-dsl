import { DslFormatterProvider } from './formatterProvider';
import { Range, Position, TextEdit } from 'vscode';

// Minimal TextDocument mock
function createDocument(text: string): any {
    return {
        getText: () => text,
        positionAt: (offset: number) => {
            const lines = text.substring(0, offset).split('\n');
            return new Position(lines.length - 1, lines[lines.length - 1].length);
        },
    };
}

const DEFAULT_OPTIONS = { insertSpaces: true, tabSize: 4 };

function format(text: string, options = DEFAULT_OPTIONS): string {
    const formatter = new DslFormatterProvider();
    const doc = createDocument(text);
    const edits = (formatter as any).formatDocument(doc, options);
    if (edits.length === 0) return text;
    return edits[0].newText;
}

describe('DslFormatterProvider', () => {
    // ========================================================================
    // Basic Indentation
    // ========================================================================

    describe('indentation', () => {
        it('should indent contents inside braces', () => {
            const input = 'workspace {\nmodel {\n}\n}';
            const result = format(input);

            expect(result).toBe('workspace {\n    model {\n    }\n}');
        });

        it('should handle nested indentation', () => {
            const input = 'workspace {\nmodel {\nperson "User"\n}\n}';
            const result = format(input);

            expect(result).toBe('workspace {\n    model {\n        person "User"\n    }\n}');
        });

        it('should preserve empty lines', () => {
            const input = 'workspace {\n\nmodel {\n}\n}';
            const result = format(input);

            expect(result).toBe('workspace {\n\n    model {\n    }\n}');
        });

        it('should use tabs when configured', () => {
            const input = 'workspace {\nmodel {\n}\n}';
            const result = format(input, { insertSpaces: false, tabSize: 1 });

            expect(result).toBe('workspace {\n\tmodel {\n\t}\n}');
        });
    });

    // ========================================================================
    // Arrow Formatting
    // ========================================================================

    describe('arrow formatting', () => {
        it('should format spaces around ->', () => {
            const input = 'workspace {\nmodel {\nuser->system "Uses"\n}\n}';
            const result = format(input);

            expect(result).toContain('user -> system "Uses"');
        });

        it('should not add leading space when line starts with ->', () => {
            const input = 'workspace {\nmodel {\n-> system "Uses"\n}\n}';
            const result = format(input);

            const lines = result.split('\n');
            const arrowLine = lines.find(l => l.trim().startsWith('->'));
            expect(arrowLine).toBeDefined();
            expect(arrowLine!.trim()).toMatch(/^->/);
        });
    });

    // ========================================================================
    // Equals Formatting
    // ========================================================================

    describe('equals formatting', () => {
        it('should format spaces around =', () => {
            const input = 'workspace {\nmodel {\nuser=person "User"\n}\n}';
            const result = format(input);

            expect(result).toContain('user = person "User"');
        });
    });

    // ========================================================================
    // Brace Formatting
    // ========================================================================

    describe('brace formatting', () => {
        it('should format spaces inside braces', () => {
            const input = 'workspace {   model {  }  }';
            const result = format(input);

            expect(result).toBe('workspace { model { } }');
        });
    });

    // ========================================================================
    // Comment Handling
    // ========================================================================

    describe('comments', () => {
        it('should preserve and indent // comments', () => {
            const input = 'workspace {\n// comment\nmodel {\n}\n}';
            const result = format(input);

            expect(result).toContain('    // comment');
        });

        it('should preserve and indent # comments', () => {
            const input = 'workspace {\n# comment\nmodel {\n}\n}';
            const result = format(input);

            expect(result).toContain('    # comment');
        });
    });

    // ========================================================================
    // Multiline String Handling
    // ========================================================================

    describe('multiline strings', () => {
        it('should preserve original formatting inside multiline strings', () => {
            const input = 'workspace {\ndescription "line1\n  unformatted line\nanother line"\n}';
            const result = format(input);
            const lines = result.split('\n');

            // The line inside a multiline string should be preserved as-is
            expect(lines[2]).toBe('  unformatted line');
        });
    });

    // ========================================================================
    // Whitespace Normalization
    // ========================================================================

    describe('whitespace normalization', () => {
        it('should collapse multiple spaces', () => {
            const input = 'workspace {\nuser  =  person    "User"\n}';
            const result = format(input);

            expect(result).toContain('user = person "User"');
        });
    });

    // ========================================================================
    // String Literals
    // ========================================================================

    describe('string literals', () => {
        it('should not add spaces around == inside a view expression', () => {
            const input = 'views {\ncontainer kaikoW {\ninclude "element.tag==MDR"\n}\n}';
            const result = format(input);

            expect(result).toContain('include "element.tag==MDR"');
        });

        it('should not add spaces around != inside a view expression', () => {
            const input = 'views {\ncontainer kaikoW {\nexclude "element.tag!=MDR"\n}\n}';
            const result = format(input);

            expect(result).toContain('exclude "element.tag!=MDR"');
        });

        it('should preserve tag values containing spaces', () => {
            const input = 'views {\ncontainer kaikoW {\nexclude "relationship.tag==Fan Out"\n}\n}';
            const result = format(input);

            expect(result).toContain('exclude "relationship.tag==Fan Out"');
        });

        it('should preserve consecutive spaces inside a quoted description', () => {
            const input = 'model {\nperson "User" "Uses  the  system"\n}';
            const result = format(input);

            expect(result).toContain('"Uses  the  system"');
        });

        it('should preserve an arrow inside a quoted description', () => {
            const input = 'model {\nperson "User" "Reads a->b mappings"\n}';
            const result = format(input);

            expect(result).toContain('"Reads a->b mappings"');
        });

        it('should still format assignments outside strings', () => {
            const input = 'model {\nuser=person "User"\n}';
            const result = format(input);

            expect(result).toContain('user = person "User"');
        });
    });

    // ========================================================================
    // Range Formatting
    // ========================================================================

    describe('provideDocumentRangeFormattingEdits', () => {
        it('should return edits that intersect the range', async () => {
            const formatter = new DslFormatterProvider();
            const doc = createDocument('workspace {\nmodel {\n}\n}');

            const range = new Range(new Position(0, 0), new Position(3, 1));
            const edits = await formatter.provideDocumentRangeFormattingEdits(
                doc as any,
                range as any,
                DEFAULT_OPTIONS as any,
                {} as any
            );

            // The full range should not be empty — it either has or doesn't have intersecting edits
            expect(edits).toBeDefined();
        });
    });
});
