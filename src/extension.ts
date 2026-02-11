import * as vscode from 'vscode';
import { DslCompletionProvider } from './completionProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('Structurizr DSL extension is now active!');

    const completionProvider = new DslCompletionProvider();
    const completionRegistration = vscode.languages.registerCompletionItemProvider(
        { language: 'structurizr-dsl', scheme: 'file' },
        completionProvider,
        ' ',
        '\n',
        '{',
        '>',
        '=',
        '(',
        '"'
    );

    const completionRegistrationAlways = vscode.languages.registerCompletionItemProvider(
        { language: 'structurizr-dsl', scheme: 'file' },
        completionProvider
    );

    context.subscriptions.push(completionRegistration, completionRegistrationAlways);

    console.log('Structurizr DSL extension providers registered');
}

export function deactivate() {
    console.log('Structurizr DSL extension is now deactivated');
}
