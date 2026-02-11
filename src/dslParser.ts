export interface ElementDefinition {
    identifier: string;
    type: string;
    name?: string;
    description?: string;
    technology?: string;
    line: number;
    startOffset: number;
    endOffset: number;
}

export interface ElementReference {
    identifier: string;
    line: number;
    startOffset: number;
    endOffset: number;
}

export interface ParsedDocument {
    definitions: Map<string, ElementDefinition>;
    references: ElementReference[];
    lines: string[];
}

/**
 * Parser for extracting element definitions and references from DSL
 */
export class DslParser {
    private text: string;
    private lines: string[];

    constructor(text: string) {
        this.text = text;
        this.lines = text.split('\n');
    }

    /**
     * Parse the document and extract all definitions and references
     */
    parse(): ParsedDocument {
        const definitions = new Map<string, ElementDefinition>();
        const references: ElementReference[] = [];
        let currentOffset = 0;

        for (let lineNum = 0; lineNum < this.lines.length; lineNum++) {
            const line = this.lines[lineNum];
            const lineStartOffset = currentOffset;
            const lineEndOffset = currentOffset + line.length;

            this.parseDefinition(line, lineNum, lineStartOffset, definitions);
            this.parseRelationshipReferences(line, lineNum, lineStartOffset, references);
            this.parseViewReferences(line, lineNum, lineStartOffset, references);

            currentOffset = lineEndOffset + 1; // +1 for newline
        }

        return { definitions, references, lines: this.lines };
    }

    /**
     * Parse element definition from a line
     * Pattern: identifier = keyword "name" ...
     */
    private parseDefinition(
        line: string,
        lineNum: number,
        lineStartOffset: number,
        definitions: Map<string, ElementDefinition>
    ): void {
        const trimmed = line.trim();

        if (trimmed.startsWith('//') || trimmed.startsWith('#') || !trimmed) {
            return;
        }

        const match = trimmed.match(/^(\w+)\s*=\s*(person|personinstance|softwaresystem|softwaresysteminstance|container|containerinstance|component|componentinstance|deploymentnode|infrastructurenode|element|group)\b/i);

        if (match) {
            const identifier = match[1];
            const type = match[2].toLowerCase();

            const nameMatch = trimmed.match(/"([^"]*)"/);
            const name = nameMatch ? nameMatch[1] : undefined;

            const descMatch = trimmed.match(/"[^"]*"\s*"([^"]*)"/);
            const description = descMatch ? descMatch[1] : undefined;

            const techMatch = trimmed.match(/"[^"]*"\s*"[^"]*"\s*"([^"]*)"/);
            const technology = techMatch ? techMatch[1] : undefined;

            const startOffset = lineStartOffset + line.indexOf(match[1]);
            const endOffset = lineStartOffset + trimmed.length;

            definitions.set(identifier, {
                identifier,
                type,
                name,
                description,
                technology,
                line: lineNum + 1,
                startOffset,
                endOffset
            });
        }
    }

    /**
     * Parse element references in relationships
     * Pattern: elem1 -> elem2 "description"
     */
    private parseRelationshipReferences(
        line: string,
        lineNum: number,
        lineStartOffset: number,
        references: ElementReference[]
    ): void {
        const relationshipPattern = /(\w+)\s*->\s*(\w+)/g;
        let match;

        while ((match = relationshipPattern.exec(line)) !== null) {
            references.push({
                identifier: match[1],
                line: lineNum + 1,
                startOffset: lineStartOffset + match.index,
                endOffset: lineStartOffset + match.index + match[1].length
            });

            const destOffset = match.index + match[0].indexOf(match[2]);
            references.push({
                identifier: match[2],
                line: lineNum + 1,
                startOffset: lineStartOffset + destOffset,
                endOffset: lineStartOffset + destOffset + match[2].length
            });
        }
    }

    /**
     * Parse references in view definitions
     * Patterns: systemContext identifier, container identifier, etc.
     */
    private parseViewReferences(
        line: string,
        lineNum: number,
        lineStartOffset: number,
        references: ElementReference[]
    ): void {
        const viewPattern = /(systemcontext|systemlandscape|container|component|filtered|dynamic|deployment|custom|image)\s+(\w+)/gi;
        let match;

        if ((match = viewPattern.exec(line)) !== null) {
            const identifier = match[2];
            const identOffset = match.index + match[0].indexOf(identifier);

            references.push({
                identifier,
                line: lineNum + 1,
                startOffset: lineStartOffset + identOffset,
                endOffset: lineStartOffset + identOffset + identifier.length
            });
        }

        const includeExcludePattern = /(include|exclude)\s+([^#\s]+)/g;
        while ((match = includeExcludePattern.exec(line)) !== null) {
            const refText = match[2];

            if (refText !== '*' && !refText.includes('==') && !refText.includes('->')) {
                const identOffset = match.index + match[0].indexOf(refText);
                references.push({
                    identifier: refText,
                    line: lineNum + 1,
                    startOffset: lineStartOffset + identOffset,
                    endOffset: lineStartOffset + identOffset + refText.length
                });
            }
        }
    }

    /**
     * Find definition by identifier
     */
    findDefinition(identifier: string): ElementDefinition | undefined {
        const parsed = this.parse();
        return parsed.definitions.get(identifier);
    }

    /**
     * Find all references to an identifier
     */
    findReferences(identifier: string): ElementReference[] {
        const parsed = this.parse();
        return parsed.references.filter(ref => ref.identifier === identifier);
    }
}
