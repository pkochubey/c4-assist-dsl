import * as vscode from 'vscode';
import { DslParser, ElementDefinition } from './dslParser';
import { getIncludeResolver } from './includeResolver';

/**
 * Provides Go to Definition functionality for Structurizr DSL
 */
export class DslDefinitionProvider implements vscode.DefinitionProvider {
    async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken
    ): Promise<vscode.Location | vscode.Location[] | undefined> {
        const wordRange = document.getWordRangeAtPosition(position, /[\w.]+/);

        if (!wordRange) {
            return undefined;
        }

        const identifier = document.getText(wordRange);

        const parser = new DslParser(document.getText(), document.uri);
        const parsed = parser.parse();

        const definition = parsed.definitions.get(identifier);

        if (definition) {
            const defPosition = document.positionAt(definition.startOffset);
            const endPosition = document.positionAt(definition.endOffset);

            return new vscode.Location(document.uri, new vscode.Range(defPosition, endPosition));
        }

        const isReference = parsed.references.some(ref =>
            ref.identifier === identifier &&
            position.line === ref.line - 1
        );

        if (isReference) {
            const includeResolver = getIncludeResolver();
            const includedDocs = await includeResolver.getIncludedDocuments(document.uri, document.getText());

            for (const doc of includedDocs) {
                const includeParser = new DslParser(doc.content, doc.uri);
                const includeParsed = includeParser.parse();

                const includeDef = includeParsed.definitions.get(identifier);

                if (includeDef) {
                    const defPosition = new vscode.Position(includeDef.line - 1, 0);
                    const endPosition = new vscode.Position(includeDef.line - 1, 100); // Approximate end

                    return new vscode.Location(doc.uri, new vscode.Range(defPosition, endPosition));
                }
            }
        }

        return undefined;
    }
}
