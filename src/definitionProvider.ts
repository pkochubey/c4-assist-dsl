import * as vscode from 'vscode';
import { parseDocumentWithIncludes } from './workspaceIndex';

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

        const { mainDocument: parsed, allDefinitions } = await parseDocumentWithIncludes(document);

        // Check main document first
        const localDef = parsed.definitions.get(identifier);
        if (localDef) {
            const defPosition = document.positionAt(localDef.startOffset);
            const endPosition = document.positionAt(localDef.endOffset);
            return new vscode.Location(document.uri, new vscode.Range(defPosition, endPosition));
        }

        // Check included files
        const includedDef = allDefinitions.get(identifier);
        if (includedDef && includedDef.sourceUri) {
            const defPosition = new vscode.Position(includedDef.line - 1, 0);
            const endPosition = new vscode.Position(includedDef.line - 1, 100);
            return new vscode.Location(includedDef.sourceUri, new vscode.Range(defPosition, endPosition));
        }

        return undefined;
    }
}

