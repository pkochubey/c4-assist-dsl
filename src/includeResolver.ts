import * as vscode from 'vscode';
import * as path from 'path';
import { IncludeDirective } from './dslParser';

export interface IncludedDocument {
    uri: vscode.Uri;
    content: string;
    definitions: Map<string, any>;
    references: any[];
}

/**
 * Manages DSL file includes and provides cached access to included files
 */
export class IncludeResolver {
    private cache = new Map<string, IncludedDocument>();

    /**
     * Parse !include directives from DSL text
     * Pattern: !include "filename.dsl" or !include filename.dsl
     */
    parseIncludeDirectives(text: string, documentUri: vscode.Uri): IncludeDirective[] {
        const includes: IncludeDirective[] = [];
        const lines = text.split('\n');
        let currentOffset = 0;

        for (let lineNum = 0; lineNum < lines.length; lineNum++) {
            const line = lines[lineNum];
            const trimmed = line.trim();
            const includeMatch = trimmed.match(/^!include\s+(?:"([^"]+)"|(\S+))/);

            if (includeMatch) {
                const includedPath = includeMatch[1] || includeMatch[2];
                const resolvedPath = this.resolveIncludePath(includedPath, documentUri);

                if (resolvedPath) {
                    includes.push({
                        filePath: resolvedPath,
                        line: lineNum + 1,
                        startOffset: currentOffset,
                        endOffset: currentOffset + line.length
                    });
                }
            }

            currentOffset += line.length + 1;
        }

        return includes;
    }

    /**
     * Resolve include path relative to the document directory
     */
    private resolveIncludePath(includePath: string, documentUri: vscode.Uri): string | undefined {
        const documentDir = path.dirname(documentUri.fsPath);
        const fullPath = path.resolve(documentDir, includePath);
        return fullPath;
    }

    /**
     * Get document content by file path
     */
    async getIncludedDocument(filePath: string): Promise<IncludedDocument | undefined> {
        if (this.cache.has(filePath)) {
            return this.cache.get(filePath);
        }

        try {
            const uri = vscode.Uri.file(filePath);
            const content = await vscode.workspace.fs.readFile(uri);
            const text = Buffer.from(content).toString('utf8');

            const doc: IncludedDocument = {
                uri,
                content: text,
                definitions: new Map(),
                references: []
            };

            this.cache.set(filePath, doc);
            return doc;
        } catch (error) {
            console.error(`Failed to load included file: ${filePath}`, error);
            return undefined;
        }
    }

    /**
     * Get all included documents for a given document
     */
    async getIncludedDocuments(documentUri: vscode.Uri, documentText: string): Promise<IncludedDocument[]> {
        const includes = this.parseIncludeDirectives(documentText, documentUri);
        const documents: IncludedDocument[] = [];

        for (const include of includes) {
            const doc = await this.getIncludedDocument(include.filePath);
            if (doc) {
                documents.push(doc);
                const nestedIncludes = await this.getIncludedDocuments(doc.uri, doc.content);
                documents.push(...nestedIncludes);
            }
        }

        return documents;
    }

    /**
     * Clear cache (call when documents are saved)
     */
    clearCache(): void {
        this.cache.clear();
    }

    /**
     * Remove specific document from cache
     */
    removeFromCache(filePath: string): void {
        this.cache.delete(filePath);
    }
}

// Singleton instance
let includeResolverInstance: IncludeResolver | undefined;

export function getIncludeResolver(): IncludeResolver {
    if (!includeResolverInstance) {
        includeResolverInstance = new IncludeResolver();
    }
    return includeResolverInstance;
}
