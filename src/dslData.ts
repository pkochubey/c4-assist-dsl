export interface KeywordInfo {
    keyword: string;
    description: string;
    detail?: string;
    insertText?: string;
}

// Context types for parsing
export enum ContextType {
    Workspace = 'workspace',
    Model = 'model',
    Person = 'person',
    SoftwareSystem = 'softwareSystem',
    Container = 'container',
    Component = 'component',
    DeploymentEnvironment = 'deploymentEnvironment',
    DeploymentNode = 'deploymentNode',
    SoftwareSystemInstance = 'softwareSystemInstance',
    ContainerInstance = 'containerInstance',
    Views = 'views',
    SystemLandscapeView = 'systemLandscapeView',
    SystemContextView = 'systemContextView',
    ContainerView = 'containerView',
    ComponentView = 'componentView',
    FilteredView = 'filteredView',
    DynamicView = 'dynamicView',
    DeploymentView = 'deploymentView',
    CustomView = 'customView',
    Styles = 'styles',
    ElementStyle = 'elementStyle',
    RelationshipStyle = 'relationshipStyle',
    Configuration = 'configuration',
    Group = 'group',
    Element = 'element',
    Properties = 'properties',
    Perspectives = 'perspectives',
    Global = 'global',
}

const BASE_VIEW_KEYWORDS: KeywordInfo[] = [
    { keyword: 'include', description: 'Include elements', detail: 'include <*|identifier|expression> ...' },
    { keyword: 'exclude', description: 'Exclude elements', detail: 'exclude <identifier|expression> ...' },
    { keyword: 'autoLayout', description: 'Auto layout', detail: 'autoLayout [tb|bt|lr|rl] [rankSep] [nodeSep]' },
    { keyword: 'default', description: 'Mark as default view', detail: 'default' },
    { keyword: 'title', description: 'View title', detail: 'title "Title"' },
    { keyword: 'description', description: 'View description', detail: 'description "text"' },
    { keyword: 'properties', description: 'View properties', detail: 'properties { ... }' },
];

export const KEYWORDS_BY_CONTEXT: Record<ContextType, KeywordInfo[]> = {
    [ContextType.Global]: [
        { keyword: 'workspace', description: 'Define a workspace', detail: 'workspace <name> [description] { ... }' },
        { keyword: '!identifiers', description: 'Set identifier mode', detail: '!identifiers <hierarchical|flat>' },
        { keyword: '!impliedRelationships', description: 'Configure implied relationships', detail: '!impliedRelationships <true|false>' },
        { keyword: '!include', description: 'Include DSL fragments', detail: '!include <file|directory|url>' },
        { keyword: '!docs', description: 'Attach documentation', detail: '!docs <path>' },
        { keyword: '!adrs', description: 'Attach ADRs', detail: '!adrs <path>' },
        { keyword: '!const', description: 'Define constant', detail: '!const <name> <value>' },
        { keyword: '!var', description: 'Define variable', detail: '!var <name> <value>' },
        { keyword: '!element', description: 'Find/extend element', detail: '!element <identifier> { ... }' },
        { keyword: '!elements', description: 'Bulk operation on elements', detail: '!elements <expression> { ... }' },
        { keyword: '!relationship', description: 'Find/extend relationship', detail: '!relationship <identifier> { ... }' },
        { keyword: '!relationships', description: 'Bulk operation on relationships', detail: '!relationships <expression> { ... }' },
        { keyword: '!script', description: 'Run script', detail: '!script <groovy|kotlin|ruby|javascript>' },
        { keyword: '!plugin', description: 'Run plugin', detail: '!plugin <fqcn>' },
    ],

    [ContextType.Workspace]: [
        { keyword: 'model', description: 'Define model section', detail: 'model { ... }' },
        { keyword: 'views', description: 'Define views section', detail: 'views { ... }' },
        { keyword: 'configuration', description: 'Define configuration section', detail: 'configuration { ... }' },
        { keyword: 'description', description: 'Workspace description', detail: 'description "text"' },
        { keyword: 'properties', description: 'Workspace properties', detail: 'properties { ... }' },
        { keyword: '!identifiers', description: 'Set identifier mode', detail: '!identifiers <hierarchical|flat>' },
        { keyword: '!docs', description: 'Attach documentation', detail: '!docs <path>' },
        { keyword: '!adrs', description: 'Attach ADRs', detail: '!adrs <path>' },
    ],

    [ContextType.Model]: [
        { keyword: 'person', description: 'Define a person/user', detail: 'person <name> [description] [tags] { ... }' },
        { keyword: 'softwareSystem', description: 'Define a software system', detail: 'softwareSystem <name> [description] [tags] { ... }' },
        { keyword: 'container', description: 'Define a container (only in !element context)', detail: 'container <name> [description] [technology] [tags] { ... }' },
        { keyword: 'component', description: 'Define a component (only in !element context)', detail: 'component <name> [description] [technology] [tags] { ... }' },
        { keyword: 'deploymentEnvironment', description: 'Define deployment environment', detail: 'deploymentEnvironment <name> { ... }' },
        { keyword: 'element', description: 'Define custom element', detail: 'element <name> [metadata] [description] [tags] { ... }' },
        { keyword: 'group', description: 'Define named grouping', detail: 'group <name> { ... }' },
        { keyword: 'archetypes', description: 'Define archetypes', detail: 'archetypes { ... }' },
        { keyword: '!identifiers', description: 'Set identifier mode', detail: '!identifiers <hierarchical|flat>' },
    ],

    [ContextType.Person]: [
        { keyword: 'description', description: 'Element description', detail: 'description "text"' },
        { keyword: 'tags', description: 'Element tags', detail: 'tags "tag1,tag2"' },
        { keyword: 'tag', description: 'Add single tag', detail: 'tag "tagname"' },
        { keyword: 'url', description: 'Element URL', detail: 'url https://example.com' },
        { keyword: 'properties', description: 'Element properties', detail: 'properties { name value ... }' },
        { keyword: 'perspectives', description: 'Element perspectives', detail: 'perspectives { ... }' },
    ],

    [ContextType.SoftwareSystem]: [
        { keyword: 'description', description: 'System description', detail: 'description "text"' },
        { keyword: 'tags', description: 'System tags', detail: 'tags "tag1,tag2"' },
        { keyword: 'tag', description: 'Add single tag', detail: 'tag "tagname"' },
        { keyword: 'url', description: 'System URL', detail: 'url https://example.com' },
        { keyword: 'properties', description: 'System properties', detail: 'properties { ... }' },
        { keyword: 'perspectives', description: 'System perspectives', detail: 'perspectives { ... }' },
        { keyword: 'container', description: 'Define container', detail: 'container <name> [description] [technology] [tags] { ... }' },
        { keyword: 'group', description: 'Define named grouping', detail: 'group <name> { ... }' },
        { keyword: '!docs', description: 'Attach documentation', detail: '!docs <path>' },
        { keyword: '!adrs', description: 'Attach ADRs', detail: '!adrs <path>' },
    ],

    [ContextType.Container]: [
        { keyword: 'description', description: 'Container description', detail: 'description "text"' },
        { keyword: 'technology', description: 'Container technology', detail: 'technology "technology name"' },
        { keyword: 'tags', description: 'Container tags', detail: 'tags "tag1,tag2"' },
        { keyword: 'tag', description: 'Add single tag', detail: 'tag "tagname"' },
        { keyword: 'url', description: 'Container URL', detail: 'url https://example.com' },
        { keyword: 'properties', description: 'Container properties', detail: 'properties { ... }' },
        { keyword: 'perspectives', description: 'Container perspectives', detail: 'perspectives { ... }' },
        { keyword: 'component', description: 'Define component', detail: 'component <name> [description] [technology] [tags] { ... }' },
        { keyword: 'group', description: 'Define named grouping', detail: 'group <name> { ... }' },
        { keyword: '!components', description: 'Component finder', detail: '!components ...' },
        { keyword: '!docs', description: 'Attach documentation', detail: '!docs <path>' },
        { keyword: '!adrs', description: 'Attach ADRs', detail: '!adrs <path>' },
    ],

    [ContextType.Component]: [
        { keyword: 'description', description: 'Component description', detail: 'description "text"' },
        { keyword: 'technology', description: 'Component technology', detail: 'technology "technology name"' },
        { keyword: 'tags', description: 'Component tags', detail: 'tags "tag1,tag2"' },
        { keyword: 'tag', description: 'Add single tag', detail: 'tag "tagname"' },
        { keyword: 'url', description: 'Component URL', detail: 'url https://example.com' },
        { keyword: 'properties', description: 'Component properties', detail: 'properties { ... }' },
        { keyword: 'perspectives', description: 'Component perspectives', detail: 'perspectives { ... }' },
        { keyword: 'group', description: 'Set group name', detail: 'group "Group Name"' },
        { keyword: '!docs', description: 'Attach documentation', detail: '!docs <path>' },
        { keyword: '!adrs', description: 'Attach ADRs', detail: '!adrs <path>' },
    ],

    [ContextType.DeploymentEnvironment]: [
        { keyword: 'deploymentNode', description: 'Define deployment node', detail: 'deploymentNode <name> [description] [technology] [tags] [instances] { ... }' },
        { keyword: 'group', description: 'Define named grouping', detail: 'group <name> { ... }' },
        { keyword: 'deploymentGroup', description: 'Define deployment group', detail: 'deploymentGroup <name>' },
    ],

    [ContextType.DeploymentNode]: [
        { keyword: 'description', description: 'Node description', detail: 'description "text"' },
        { keyword: 'technology', description: 'Node technology', detail: 'technology "technology name"' },
        { keyword: 'instances', description: 'Number of instances', detail: 'instances "4"' },
        { keyword: 'tags', description: 'Node tags', detail: 'tags "tag1,tag2"' },
        { keyword: 'tag', description: 'Add single tag', detail: 'tag "tagname"' },
        { keyword: 'url', description: 'Node URL', detail: 'url https://example.com' },
        { keyword: 'properties', description: 'Node properties', detail: 'properties { ... }' },
        { keyword: 'perspectives', description: 'Node perspectives', detail: 'perspectives { ... }' },
        { keyword: 'deploymentNode', description: 'Nested deployment node', detail: 'deploymentNode <name> [description] [technology] [tags] [instances] { ... }' },
        { keyword: 'infrastructureNode', description: 'Define infrastructure node', detail: 'infrastructureNode <name> [description] [technology] [tags] { ... }' },
        { keyword: 'softwareSystemInstance', description: 'Define software system instance', detail: 'softwareSystemInstance <identifier> [deploymentGroups] [tags] { ... }' },
        { keyword: 'containerInstance', description: 'Define container instance', detail: 'containerInstance <identifier> [deploymentGroups] [tags] { ... }' },
        { keyword: 'group', description: 'Define named grouping', detail: 'group <name> { ... }' },
    ],

    [ContextType.SoftwareSystemInstance]: [
        { keyword: 'description', description: 'Instance description', detail: 'description "text"' },
        { keyword: 'tags', description: 'Instance tags', detail: 'tags "tag1,tag2"' },
        { keyword: 'tag', description: 'Add single tag', detail: 'tag "tagname"' },
        { keyword: 'url', description: 'Instance URL', detail: 'url https://example.com' },
        { keyword: 'properties', description: 'Instance properties', detail: 'properties { ... }' },
        { keyword: 'perspectives', description: 'Instance perspectives', detail: 'perspectives { ... }' },
        { keyword: 'healthCheck', description: 'Define health check', detail: 'healthCheck <name> <url> [interval] [timeout]' },
    ],

    [ContextType.ContainerInstance]: [
        { keyword: 'description', description: 'Instance description', detail: 'description "text"' },
        { keyword: 'tags', description: 'Instance tags', detail: 'tags "tag1,tag2"' },
        { keyword: 'tag', description: 'Add single tag', detail: 'tag "tagname"' },
        { keyword: 'url', description: 'Instance URL', detail: 'url https://example.com' },
        { keyword: 'properties', description: 'Instance properties', detail: 'properties { ... }' },
        { keyword: 'perspectives', description: 'Instance perspectives', detail: 'perspectives { ... }' },
        { keyword: 'healthCheck', description: 'Define health check', detail: 'healthCheck <name> <url> [interval] [timeout]' },
    ],

    [ContextType.Views]: [
        { keyword: 'systemLandscape', description: 'System landscape view', detail: 'systemLandscape [key] [description] { ... }' },
        { keyword: 'systemContext', description: 'System context view', detail: 'systemContext <softwareSystemId> [key] [description] { ... }' },
        { keyword: 'container', description: 'Container view', detail: 'container <softwareSystemId> [key] [description] { ... }' },
        { keyword: 'component', description: 'Component view', detail: 'component <containerId> [key] [description] { ... }' },
        { keyword: 'filtered', description: 'Filtered view', detail: 'filtered <baseKey> <include|exclude> <tags> [key] [description] { ... }' },
        { keyword: 'dynamic', description: 'Dynamic view', detail: 'dynamic <*|softwareSystemId|containerId> [key] [description] { ... }' },
        { keyword: 'deployment', description: 'Deployment view', detail: 'deployment <*|softwareSystemId> <environment> [key] [description] { ... }' },
        { keyword: 'custom', description: 'Custom view', detail: 'custom [key] [title] [description] { ... }' },
        { keyword: 'image', description: 'Image view', detail: 'image <*|elementId> [key] { ... }' },
        { keyword: 'styles', description: 'Styles section', detail: 'styles { ... }' },
        { keyword: 'theme', description: 'Theme URL', detail: 'theme <url|file|default>' },
        { keyword: 'themes', description: 'Theme URLs', detail: 'themes <url|file> ...' },
        { keyword: 'branding', description: 'Branding configuration', detail: 'branding { ... }' },
        { keyword: 'terminology', description: 'Terminology configuration', detail: 'terminology { ... }' },
        { keyword: 'properties', description: 'View properties', detail: 'properties { ... }' },
    ],


    [ContextType.SystemLandscapeView]: [
        ...BASE_VIEW_KEYWORDS,
        { keyword: 'animation', description: 'Animation steps', detail: 'animation { identifier ... }' },
    ],

    [ContextType.SystemContextView]: [
        ...BASE_VIEW_KEYWORDS,
        { keyword: 'animation', description: 'Animation steps', detail: 'animation { identifier ... }' },
    ],

    [ContextType.ContainerView]: [
        ...BASE_VIEW_KEYWORDS,
        { keyword: 'animation', description: 'Animation steps', detail: 'animation { identifier ... }' },
    ],

    [ContextType.ComponentView]: [
        ...BASE_VIEW_KEYWORDS,
        { keyword: 'animation', description: 'Animation steps', detail: 'animation { identifier ... }' },
    ],

    [ContextType.FilteredView]: [
        ...BASE_VIEW_KEYWORDS,
    ],

    [ContextType.DynamicView]: [
        ...BASE_VIEW_KEYWORDS,
    ],

    [ContextType.DeploymentView]: [
        ...BASE_VIEW_KEYWORDS,
    ],

    [ContextType.CustomView]: [
        ...BASE_VIEW_KEYWORDS,
    ],

    [ContextType.Styles]: [
        { keyword: 'element', description: 'Element style', detail: 'element <tag> { ... }' },
        { keyword: 'relationship', description: 'Relationship style', detail: 'relationship <tag> { ... }' },
    ],

    [ContextType.ElementStyle]: [
        { keyword: 'shape', description: 'Element shape', detail: 'shape <Box|RoundedBox|Circle|...>' },
        { keyword: 'icon', description: 'Element icon', detail: 'icon <file|url>' },
        { keyword: 'width', description: 'Element width', detail: 'width <integer>' },
        { keyword: 'height', description: 'Element height', detail: 'height <integer>' },
        { keyword: 'background', description: 'Background color', detail: 'background <#rrggbb|color>' },
        { keyword: 'color', description: 'Foreground color', detail: 'color <#rrggbb|color>' },
        { keyword: 'stroke', description: 'Stroke color', detail: 'stroke <#rrggbb|color>' },
        { keyword: 'strokeWidth', description: 'Stroke width', detail: 'strokeWidth <1-10>' },
        { keyword: 'fontSize', description: 'Font size', detail: 'fontSize <integer>' },
        { keyword: 'border', description: 'Border style', detail: 'border <solid|dashed|dotted>' },
        { keyword: 'opacity', description: 'Opacity', detail: 'opacity <0-100>' },
        { keyword: 'metadata', description: 'Show metadata', detail: 'metadata <true|false>' },
        { keyword: 'description', description: 'Show description', detail: 'description <true|false>' },
        { keyword: 'properties', description: 'Style properties', detail: 'properties { ... }' },
    ],

    [ContextType.RelationshipStyle]: [
        { keyword: 'thickness', description: 'Line thickness', detail: 'thickness <integer>' },
        { keyword: 'color', description: 'Line color', detail: 'color <#rrggbb|color>' },
        { keyword: 'style', description: 'Line style', detail: 'style <solid|dashed|dotted>' },
        { keyword: 'routing', description: 'Line routing', detail: 'routing <Direct|Orthogonal|Curved>' },
        { keyword: 'fontSize', description: 'Font size', detail: 'fontSize <integer>' },
        { keyword: 'width', description: 'Line width', detail: 'width <integer>' },
        { keyword: 'position', description: 'Label position', detail: 'position <0-100>' },
        { keyword: 'opacity', description: 'Opacity', detail: 'opacity <0-100>' },
        { keyword: 'properties', description: 'Style properties', detail: 'properties { ... }' },
    ],

    [ContextType.Configuration]: [
        { keyword: 'scope', description: 'Workspace scope', detail: 'scope <landscape|softwaresystem|none>' },
        { keyword: 'visibility', description: 'Workspace visibility', detail: 'visibility <private|public>' },
        { keyword: 'users', description: 'User permissions', detail: 'users { ... }' },
        { keyword: 'properties', description: 'Configuration properties', detail: 'properties { ... }' },
    ],

    [ContextType.Group]: [
        { keyword: 'person', description: 'Define a person', detail: 'person <name> [description] [tags] { ... }' },
        { keyword: 'softwareSystem', description: 'Define a software system', detail: 'softwareSystem <name> [description] [tags] { ... }' },
        { keyword: 'container', description: 'Define a container', detail: 'container <name> [description] [technology] [tags] { ... }' },
        { keyword: 'component', description: 'Define a component', detail: 'component <name> [description] [technology] [tags] { ... }' },
        { keyword: 'deploymentNode', description: 'Define deployment node', detail: 'deploymentNode <name> [description] [technology] [tags] [instances] { ... }' },
        { keyword: 'infrastructureNode', description: 'Define infrastructure node', detail: 'infrastructureNode <name> [description] [technology] [tags] { ... }' },
        { keyword: 'element', description: 'Define custom element', detail: 'element <name> [metadata] [description] [tags] { ... }' },
        { keyword: 'group', description: 'Nested group', detail: 'group <name> { ... }' },
    ],

    [ContextType.Element]: [
        { keyword: 'description', description: 'Element description', detail: 'description "text"' },
        { keyword: 'tags', description: 'Element tags', detail: 'tags "tag1,tag2"' },
        { keyword: 'url', description: 'Element URL', detail: 'url https://example.com' },
        { keyword: 'properties', description: 'Element properties', detail: 'properties { ... }' },
        { keyword: 'perspectives', description: 'Element perspectives', detail: 'perspectives { ... }' },
        { keyword: 'technology', description: 'Element technology', detail: 'technology "technology name"' },
    ],

    [ContextType.Properties]: [
    ],

    [ContextType.Perspectives]: [
    ],
};

export const SHAPE_VALUES = [
    'Box', 'RoundedBox', 'Circle', 'Ellipse', 'Hexagon', 'Cylinder',
    'Pipe', 'Person', 'Robot', 'Folder', 'WebBrowser',
    'MobileDevicePortrait', 'MobileDeviceLandscape', 'Component'
];

export const ELEMENT_EXPRESSIONS = [
    'element.type==Person',
    'element.type==SoftwareSystem',
    'element.type==Container',
    'element.type==Component',
    'element.parent==',
    'element.tag==',
    'element.technology==',
    'element.properties[',
];

export const RELATIONSHIP_EXPRESSIONS = [
    '*->*',
    'relationship.tag==',
    'relationship.source==',
    'relationship.destination==',
];

export const AUTOLAYOUT_DIRECTIONS = ['tb', 'bt', 'lr', 'rl'];

export const BORDER_STYLES = ['solid', 'dashed', 'dotted'];

export const ROUTING_STYLES = ['Direct', 'Orthogonal', 'Curved'];

export const SCOPE_VALUES = ['landscape', 'softwaresystem', 'none'];

export const VISIBILITY_VALUES = ['private', 'public'];

export const ALL_KEYWORDS = new Set<string>();
for (const keywords of Object.values(KEYWORDS_BY_CONTEXT)) {
    for (const kw of keywords) {
        ALL_KEYWORDS.add(kw.keyword.toLowerCase());
    }
}

const SPECIAL_KEYWORDS = ['extends', 'true', 'false', 'default'];
SPECIAL_KEYWORDS.forEach(k => ALL_KEYWORDS.add(k));
