/**
 * Minimal vscode mock for unit tests.
 * Only stubs used by parser, context, and formatter.
 */

export class Uri {
    readonly scheme: string;
    readonly fsPath: string;

    private constructor(scheme: string, fsPath: string) {
        this.scheme = scheme;
        this.fsPath = fsPath;
    }

    static file(path: string): Uri {
        return new Uri('file', path);
    }

    toString(): string {
        return `${this.scheme}://${this.fsPath}`;
    }
}

export class Position {
    constructor(
        public readonly line: number,
        public readonly character: number
    ) {}
}

export class Range {
    constructor(
        public readonly start: Position | number,
        public readonly end: Position | number,
        public readonly startChar?: number,
        public readonly endChar?: number
    ) {
        if (typeof start === 'number') {
            this.start = new Position(start as number, end as number);
            this.end = new Position(startChar!, endChar!);
        }
    }

    intersection(_other: Range): Range | undefined {
        return undefined;
    }
}

export class TextEdit {
    constructor(
        public readonly range: Range,
        public readonly newText: string
    ) {}

    static replace(range: Range, newText: string): TextEdit {
        return new TextEdit(range, newText);
    }
}

export enum DiagnosticSeverity {
    Error = 0,
    Warning = 1,
    Information = 2,
    Hint = 3,
}

export class Diagnostic {
    public code?: string | number;

    constructor(
        public readonly range: Range,
        public readonly message: string,
        public readonly severity?: DiagnosticSeverity
    ) {}
}
