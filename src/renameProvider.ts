import * as vscode from 'vscode';
import { DslParser, ElementDefinition } from './dslParser';

/**
 * Provides Rename Symbol functionality for Structurizr DSL
 */
export class DslRenameProvider implements vscode.RenameProvider {
    async prepareRename(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken
    ): Promise<vscode.Range | undefined> {
        const parser = new DslParser(document.getText());
        const parsed = parser.parse();
        const wordRange = document.getWordRangeAtPosition(position, /[\w.]+/);

        if (!wordRange) {
            return undefined;
        }

        const identifier = document.getText(wordRange);

        if (parsed.definitions.has(identifier)) {
            return wordRange;
        }

        const isReference = parsed.references.some(ref =>
            ref.identifier === identifier &&
            position.line === ref.line - 1
        );

        if (isReference) {
            return wordRange;
        }

        throw new Error(`Cannot rename '${identifier}'. It is not a defined element or valid reference.`);
    }

    async provideRenameEdits(
        document: vscode.TextDocument,
        position: vscode.Position,
        newName: string,
        _token: vscode.CancellationToken
    ): Promise<vscode.WorkspaceEdit | undefined> {
        const parser = new DslParser(document.getText());
        const parsed = parser.parse();
        const wordRange = document.getWordRangeAtPosition(position, /[\w.]+/);

        if (!wordRange) {
            return undefined;
        }

        const oldIdentifier = document.getText(wordRange);

        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(newName)) {
            throw new Error(`Invalid identifier '${newName}'. Identifiers must start with a letter or underscore and contain only letters, digits, and underscores.`);
        }

        if (!parsed.definitions.has(oldIdentifier)) {
            throw new Error(`Cannot find definition for '${oldIdentifier}'`);
        }

        const edit = new vscode.WorkspaceEdit();

        const definition = parsed.definitions.get(oldIdentifier);
        if (definition) {
            const defPosition = document.positionAt(definition.startOffset);
            const defEndPosition = document.positionAt(definition.startOffset + oldIdentifier.length);
            edit.replace(document.uri, new vscode.Range(defPosition, defEndPosition), newName);
        }

        for (const ref of parsed.references) {
            if (ref.identifier === oldIdentifier) {
                const refPosition = document.positionAt(ref.startOffset);
                const refEndPosition = document.positionAt(ref.endOffset);
                edit.replace(document.uri, new vscode.Range(refPosition, refEndPosition), newName);
            }
        }

        return edit;
    }
}
