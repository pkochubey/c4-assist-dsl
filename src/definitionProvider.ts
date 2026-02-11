import * as vscode from 'vscode';
import { DslParser, ElementDefinition } from './dslParser';

/**
 * Provides Go to Definition functionality for Structurizr DSL
 */
export class DslDefinitionProvider implements vscode.DefinitionProvider {
    async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken
    ): Promise<vscode.Location | vscode.Location[] | undefined> {
        const parser = new DslParser(document.getText());
        const parsed = parser.parse();
        const wordRange = document.getWordRangeAtPosition(position, /[\w.]+/);

        if (!wordRange) {
            return undefined;
        }

        const identifier = document.getText(wordRange);

        const definition = parsed.definitions.get(identifier);

        if (definition) {
            const defPosition = document.positionAt(definition.startOffset);
            const endPosition = document.positionAt(definition.endOffset);

            return new vscode.Location(document.uri, new vscode.Range(defPosition, endPosition));
        }

        const isReference = parsed.references.some(ref =>
            ref.identifier === identifier &&
            position.line === ref.line - 1 &&
            position.character >= ref.startOffset - document.offsetAt(new vscode.Position(ref.line - 1, 0)) + document.offsetAt(new vscode.Position(ref.line - 1, 0))
        );

        if (isReference) {
            const definition = parsed.definitions.get(identifier);

            if (definition) {
                const defPosition = document.positionAt(definition.startOffset);
                const endPosition = document.positionAt(definition.endOffset);

                return new vscode.Location(document.uri, new vscode.Range(defPosition, endPosition));
            }
        }

        return undefined;
    }
}
