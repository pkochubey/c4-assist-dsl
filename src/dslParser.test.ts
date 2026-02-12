import { DslParser } from './dslParser';
import { Uri } from 'vscode';

const TEST_URI = Uri.file('/test/workspace.dsl');

describe('DslParser', () => {
    // ========================================================================
    // Element Definitions
    // ========================================================================

    describe('parseDefinition', () => {
        it('should parse person definition', () => {
            const parser = new DslParser('user = person "User"', TEST_URI);
            const result = parser.parse();

            expect(result.definitions.size).toBe(1);
            const def = result.definitions.get('user')!;
            expect(def.identifier).toBe('user');
            expect(def.type).toBe('person');
            expect(def.name).toBe('User');
            expect(def.line).toBe(1);
        });

        it('should parse softwareSystem with description', () => {
            const parser = new DslParser('system = softwareSystem "My System" "Main system"', TEST_URI);
            const result = parser.parse();

            const def = result.definitions.get('system')!;
            expect(def.type).toBe('softwaresystem');
            expect(def.name).toBe('My System');
            expect(def.description).toBe('Main system');
        });

        it('should parse container with technology', () => {
            const parser = new DslParser('db = container "Database" "Stores data" "PostgreSQL"', TEST_URI);
            const result = parser.parse();

            const def = result.definitions.get('db')!;
            expect(def.type).toBe('container');
            expect(def.name).toBe('Database');
            expect(def.description).toBe('Stores data');
            expect(def.technology).toBe('PostgreSQL');
        });

        it('should parse multiple definitions', () => {
            const text = [
                'user = person "User"',
                'system = softwareSystem "System"',
                'db = container "DB"',
            ].join('\n');

            const parser = new DslParser(text, TEST_URI);
            const result = parser.parse();

            expect(result.definitions.size).toBe(3);
            expect(result.definitions.has('user')).toBe(true);
            expect(result.definitions.has('system')).toBe(true);
            expect(result.definitions.has('db')).toBe(true);
        });

        it('should skip comment lines', () => {
            const text = [
                '// user = person "Commented"',
                '# user2 = person "Also commented"',
                'real = person "Real"',
            ].join('\n');

            const parser = new DslParser(text, TEST_URI);
            const result = parser.parse();

            expect(result.definitions.size).toBe(1);
            expect(result.definitions.has('real')).toBe(true);
        });

        it('should skip empty lines', () => {
            const text = ['', 'user = person "User"', ''].join('\n');
            const parser = new DslParser(text, TEST_URI);
            const result = parser.parse();

            expect(result.definitions.size).toBe(1);
        });

        it('should parse all element types', () => {
            const types = [
                'a = person "A"',
                'b = softwareSystem "B"',
                'c = container "C"',
                'd = component "D"',
                'e = deploymentNode "E"',
                'f = infrastructureNode "F"',
                'g = element "G"',
                'h = group "H"',
            ];

            const parser = new DslParser(types.join('\n'), TEST_URI);
            const result = parser.parse();

            expect(result.definitions.size).toBe(8);
        });

        it('should be case-insensitive for keywords', () => {
            const parser = new DslParser('user = Person "User"', TEST_URI);
            const result = parser.parse();

            expect(result.definitions.size).toBe(1);
            expect(result.definitions.get('user')!.type).toBe('person');
        });

        it('should store sourceUri', () => {
            const parser = new DslParser('x = person "X"', TEST_URI);
            const result = parser.parse();

            expect(result.definitions.get('x')!.sourceUri).toBe(TEST_URI);
        });

        it('should compute correct line numbers', () => {
            const text = ['', '', 'user = person "User"'].join('\n');
            const parser = new DslParser(text, TEST_URI);
            const result = parser.parse();

            expect(result.definitions.get('user')!.line).toBe(3);
        });
    });

    // ========================================================================
    // Relationship References
    // ========================================================================

    describe('parseRelationshipReferences', () => {
        it('should parse relationship references', () => {
            const parser = new DslParser('user -> system "Uses"', TEST_URI);
            const result = parser.parse();

            expect(result.references).toHaveLength(2);
            expect(result.references[0].identifier).toBe('user');
            expect(result.references[1].identifier).toBe('system');
        });

        it('should parse multiple relationships', () => {
            const text = [
                'user -> system "Uses"',
                'system -> db "Reads from"',
            ].join('\n');

            const parser = new DslParser(text, TEST_URI);
            const result = parser.parse();

            expect(result.references).toHaveLength(4);
            const ids = result.references.map(r => r.identifier);
            expect(ids).toContain('user');
            expect(ids).toContain('system');
            expect(ids).toContain('db');
        });

        it('should skip !include lines', () => {
            const parser = new DslParser('!include common.dsl', TEST_URI);
            const result = parser.parse();

            const relRefs = result.references.filter(r =>
                r.identifier !== 'common' && r.identifier !== 'common.dsl'
            );
            expect(relRefs).toHaveLength(0);
        });
    });

    // ========================================================================
    // View References
    // ========================================================================

    describe('parseViewReferences', () => {
        it('should parse systemContext view reference', () => {
            const parser = new DslParser('systemContext mySystem {', TEST_URI);
            const result = parser.parse();

            const refs = result.references.filter(r => r.identifier === 'mySystem');
            expect(refs.length).toBeGreaterThanOrEqual(1);
        });

        it('should parse include/exclude references', () => {
            const text = [
                'systemContext system {',
                '    include user',
                '    exclude admin',
                '}',
            ].join('\n');

            const parser = new DslParser(text, TEST_URI);
            const result = parser.parse();

            const ids = result.references.map(r => r.identifier);
            expect(ids).toContain('user');
            expect(ids).toContain('admin');
        });

        it('should not treat * as view reference', () => {
            const parser = new DslParser('include *', TEST_URI);
            const result = parser.parse();

            const refs = result.references.filter(r => r.identifier === '*');
            expect(refs).toHaveLength(0);
        });
    });

    // ========================================================================
    // Include Directives
    // ========================================================================

    describe('parseInclude', () => {
        it('should parse quoted include', () => {
            const parser = new DslParser('!include "common.dsl"', TEST_URI);
            const result = parser.parse();

            expect(result.includes).toHaveLength(1);
            expect(result.includes[0].filePath).toBe('common.dsl');
        });

        it('should parse unquoted include', () => {
            const parser = new DslParser('!include common.dsl', TEST_URI);
            const result = parser.parse();

            expect(result.includes).toHaveLength(1);
            expect(result.includes[0].filePath).toBe('common.dsl');
        });

        it('should parse multiple includes', () => {
            const text = [
                '!include "a.dsl"',
                '!include b.dsl',
            ].join('\n');

            const parser = new DslParser(text, TEST_URI);
            const result = parser.parse();

            expect(result.includes).toHaveLength(2);
            expect(result.includes[0].filePath).toBe('a.dsl');
            expect(result.includes[1].filePath).toBe('b.dsl');
        });
    });

    // ========================================================================
    // Convenience Methods
    // ========================================================================

    describe('findDefinition', () => {
        it('should find existing definition', () => {
            const parser = new DslParser('user = person "User"', TEST_URI);
            const def = parser.findDefinition('user');

            expect(def).toBeDefined();
            expect(def!.name).toBe('User');
        });

        it('should return undefined for missing definition', () => {
            const parser = new DslParser('user = person "User"', TEST_URI);
            const def = parser.findDefinition('nonexistent');

            expect(def).toBeUndefined();
        });
    });

    describe('findReferences', () => {
        it('should find all references to an identifier', () => {
            const text = [
                'user = person "User"',
                'user -> system "Uses"',
            ].join('\n');

            const parser = new DslParser(text, TEST_URI);
            const refs = parser.findReferences('user');

            expect(refs.length).toBeGreaterThanOrEqual(1);
            expect(refs.every(r => r.identifier === 'user')).toBe(true);
        });
    });

    // ========================================================================
    // Lines Array
    // ========================================================================

    describe('lines', () => {
        it('should return correct lines array', () => {
            const text = 'line1\nline2\nline3';
            const parser = new DslParser(text, TEST_URI);
            const result = parser.parse();

            expect(result.lines).toEqual(['line1', 'line2', 'line3']);
        });
    });
});
