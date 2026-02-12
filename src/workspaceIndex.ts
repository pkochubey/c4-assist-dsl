import * as vscode from 'vscode';
import { DslParser, ElementDefinition, ElementReference, ParsedDocument } from './dslParser';
import { getIncludeResolver, IncludedDocument } from './includeResolver';

/**
 * Aggregated parse result combining the main document and all included files
 */
export interface AggregatedParseResult {
    /** Parsed result of the main document */
    mainDocument: ParsedDocument;
    /** All definitions from main document + includes */
    allDefinitions: Map<string, ElementDefinition>;
    /** All included documents (already resolved) */
    includedDocs: IncludedDocument[];
}

/**
 * Centralized service for parsing a DSL document with all its includes.
 * Eliminates duplicated parse+include logic across providers.
 */
export async function parseDocumentWithIncludes(
    document: vscode.TextDocument
): Promise<AggregatedParseResult> {
    const parser = new DslParser(document.getText(), document.uri);
    const mainDocument = parser.parse();

    const includeResolver = getIncludeResolver();
    const includedDocs = await includeResolver.getIncludedDocuments(document.uri, document.getText());

    const allDefinitions = new Map<string, ElementDefinition>(mainDocument.definitions);

    for (const doc of includedDocs) {
        const includeParser = new DslParser(doc.content, doc.uri);
        const includeParsed = includeParser.parse();

        for (const [identifier, definition] of includeParsed.definitions) {
            if (!allDefinitions.has(identifier)) {
                allDefinitions.set(identifier, definition);
            }
        }
    }

    return { mainDocument, allDefinitions, includedDocs };
}

/**
 * Find a definition by identifier across the main document and all includes.
 * Returns the definition and whether it came from an included file.
 */
export function findDefinitionInResult(
    result: AggregatedParseResult,
    identifier: string
): ElementDefinition | undefined {
    return result.allDefinitions.get(identifier);
}
