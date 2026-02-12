import * as vscode from 'vscode';
import { DslCompletionProvider } from './completionProvider';
import { DslDiagnosticProvider } from './diagnosticProvider';
import { DslDefinitionProvider } from './definitionProvider';
import { DslRenameProvider } from './renameProvider';
import { DslHoverProvider } from './hoverProvider';
import { DslFormatterProvider } from './formatterProvider';
import { getIncludeResolver } from './includeResolver';

export function activate(context: vscode.ExtensionContext) {
    console.log('Structurizr DSL extension is now active!');

    const completionProvider = new DslCompletionProvider();
    const completionRegistration = vscode.languages.registerCompletionItemProvider(
        { language: 'structurizr-dsl', scheme: 'file' },
        completionProvider,
        ' ',
        '>',
        '=',
        '(',
        '"'
    );

    const diagnosticProvider = new DslDiagnosticProvider(context);

    vscode.workspace.textDocuments.forEach(doc => {
        if (doc.languageId === 'structurizr-dsl') {
            diagnosticProvider.validateDocument(doc);
        }
    });

    const documentSaveDisposable = vscode.workspace.onDidSaveTextDocument(doc => {
        if (doc.languageId === 'structurizr-dsl') {
            diagnosticProvider.validateDocument(doc);
            getIncludeResolver().clearCache();
        }
    });

    let debounceTimer: ReturnType<typeof setTimeout> | undefined;
    const documentChangeDisposable = vscode.workspace.onDidChangeTextDocument(event => {
        if (event.document.languageId === 'structurizr-dsl') {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
            debounceTimer = setTimeout(() => {
                diagnosticProvider.validateDocument(event.document);
            }, 500);
        }
    });

    const documentOpenDisposable = vscode.workspace.onDidOpenTextDocument(doc => {
        if (doc.languageId === 'structurizr-dsl') {
            diagnosticProvider.validateDocument(doc);
        }
    });

    const definitionProvider = new DslDefinitionProvider();
    const definitionRegistration = vscode.languages.registerDefinitionProvider(
        { language: 'structurizr-dsl', scheme: 'file' },
        definitionProvider
    );

    const renameProvider = new DslRenameProvider();
    const renameRegistration = vscode.languages.registerRenameProvider(
        { language: 'structurizr-dsl', scheme: 'file' },
        renameProvider
    );

    const hoverProvider = new DslHoverProvider();
    const hoverRegistration = vscode.languages.registerHoverProvider(
        { language: 'structurizr-dsl', scheme: 'file' },
        hoverProvider
    );

    const formatterProvider = new DslFormatterProvider();
    const formatterRegistration = vscode.languages.registerDocumentFormattingEditProvider(
        { language: 'structurizr-dsl', scheme: 'file' },
        formatterProvider
    );

    const rangeFormatterRegistration = vscode.languages.registerDocumentRangeFormattingEditProvider(
        { language: 'structurizr-dsl', scheme: 'file' },
        formatterProvider
    );

    context.subscriptions.push(
        completionRegistration,
        definitionRegistration,
        renameRegistration,
        hoverRegistration,
        formatterRegistration,
        rangeFormatterRegistration,
        documentSaveDisposable,
        documentChangeDisposable,
        documentOpenDisposable
    );

    console.log('Structurizr DSL extension providers registered');
}

export function deactivate() {
    console.log('Structurizr DSL extension is now deactivated');
}
