/**
 * Structurizr DSL keyword documentation
 * Based on https://docs.structurizr.com/dsl/language
 */

export interface KeywordDoc {
    keyword: string;
    description: string;
    syntax?: string;
    link?: string;
    permittedChildren?: string[];
}

export const KEYWORD_DOCUMENTATION: Record<string, KeywordDoc> = {
    // Workspace and Model
    'workspace': {
        keyword: 'workspace',
        description: 'Top level language construct and wrapper for model and views. Can optionally be given a name and description.',
        syntax: 'workspace [name] [description] { ... }',
        link: 'https://docs.structurizr.com/dsl/language#workspace',
        permittedChildren: ['name', 'description', 'properties', '!identifiers', '!docs', '!adrs', 'model', 'views', 'configuration']
    },
    'model': {
        keyword: 'model',
        description: 'Block inside which elements and relationships are defined. Each workspace must contain a model block.',
        syntax: 'model { ... }',
        link: 'https://docs.structurizr.com/dsl/language#model',
        permittedChildren: ['!identifiers', 'archetypes', 'group', 'person', 'softwareSystem']
    },

    // Element definitions
    'person': {
        keyword: 'person',
        description: 'Defines a person (e.g. a user, actor, role, or persona). Tags: Element, Person',
        syntax: 'person <name> [description] [tags] { ... }',
        link: 'https://docs.structurizr.com/dsl/language#person',
        permittedChildren: ['description', 'tags', 'tag', 'url', 'properties', 'perspectives']
    },
    'softwareSystem': {
        keyword: 'softwareSystem',
        description: 'Defines a software system. Tags: Element, Software System',
        syntax: 'softwareSystem <name> [description] [tags] { ... }',
        link: 'https://docs.structurizr.com/dsl/language#softwareSystem',
        permittedChildren: ['!docs', '!adrs', 'group', 'container', 'description', 'tags', 'url', 'properties', 'perspectives']
    },
    'container': {
        keyword: 'container',
        description: '1. Defines a container within a software system (element). Tags: Element, Container\n2. Defines a Container view for a specified software system.',
        syntax: 'Element: container <name> [description] [technology] [tags] { ... }\nView: container <softwareSystemId> [key] [description] { ... }',
        link: 'https://docs.structurizr.com/dsl/language#container',
        permittedChildren: ['!docs', '!adrs', 'group', 'component', '!components', 'description', 'technology', 'tags', 'url', 'properties', 'perspectives', 'include', 'exclude', 'autoLayout', 'default', 'animation', 'title']
    },
    'component': {
        keyword: 'component',
        description: '1. Defines a component within a container (element). Tags: Element, Component\n2. Defines a Component view for a specified container.',
        syntax: 'Element: component <name> [description] [technology] [tags] { ... }\nView: component <containerId> [key] [description] { ... }',
        link: 'https://docs.structurizr.com/dsl/language#component',
        permittedChildren: ['!docs', '!adrs', 'description', 'technology', 'tags', 'url', 'properties', 'perspectives', 'group', 'include', 'exclude', 'autoLayout', 'default', 'animation', 'title']
    },
    'deploymentEnvironment': {
        keyword: 'deploymentEnvironment',
        description: 'Defines a deployment environment (e.g. development, testing, staging, live, etc).',
        syntax: 'deploymentEnvironment <name> { ... }',
        link: 'https://docs.structurizr.com/dsl/language#deploymentEnvironment',
        permittedChildren: ['group', 'deploymentGroup', 'deploymentNode']
    },
    'deploymentNode': {
        keyword: 'deploymentNode',
        description: 'Defines a deployment node. Tags: Element, Deployment Node',
        syntax: 'deploymentNode <name> [description] [technology] [tags] [instances] { ... }',
        link: 'https://docs.structurizr.com/dsl/language#deploymentNode',
        permittedChildren: ['group', 'deploymentNode', 'infrastructureNode', 'softwareSystemInstance', 'containerInstance', 'description', 'technology', 'instances', 'tags', 'url', 'properties', 'perspectives']
    },
    'infrastructureNode': {
        keyword: 'infrastructureNode',
        description: 'Defines an infrastructure node (e.g. load balancer, firewall, DNS service). Tags: Element, Infrastructure Node',
        syntax: 'infrastructureNode <name> [description] [technology] [tags] { ... }',
        link: 'https://docs.structurizr.com/dsl/language#infrastructureNode',
        permittedChildren: ['description', 'technology', 'tags', 'url', 'properties', 'perspectives']
    },
    'group': {
        keyword: 'group',
        description: 'Defines a named grouping of elements, rendered as a boundary around those elements. Groups can be nested.',
        syntax: 'group <name> { ... }',
        link: 'https://docs.structurizr.com/dsl/language#group'
    },

    // Properties
    'description': {
        keyword: 'description',
        description: 'Sets description on an element or view.',
        syntax: 'description "text"',
        link: 'https://docs.structurizr.com/dsl/language#description'
    },
    'tags': {
        keyword: 'tags',
        description: 'Adds tags to an element or relationship. Tags can be comma separated or specified individually.',
        syntax: 'tags "tag1,tag2"',
        link: 'https://docs.structurizr.com/dsl/language#tags'
    },
    'tag': {
        keyword: 'tag',
        description: 'Adds a single tag to an element or relationship.',
        syntax: 'tag "tagname"',
        link: 'https://docs.structurizr.com/dsl/language#tag'
    },
    'technology': {
        keyword: 'technology',
        description: 'Sets technology on a container, component, deployment node, or infrastructure node.',
        syntax: 'technology "technology name"',
        link: 'https://docs.structurizr.com/dsl/language#technology'
    },
    'properties': {
        keyword: 'properties',
        description: 'Defines one or more name/value properties.',
        syntax: 'properties { name value ... }',
        link: 'https://docs.structurizr.com/dsl/language#properties'
    },
    'perspectives': {
        keyword: 'perspectives',
        description: 'Defines one or more named perspectives for an element or relationship.',
        syntax: 'perspectives { name <description> [value] ... }',
        link: 'https://docs.structurizr.com/dsl/language#perspectives'
    },
    'url': {
        keyword: 'url',
        description: 'Sets a URL on an element or relationship.',
        syntax: 'url https://example.com',
        link: 'https://docs.structurizr.com/dsl/language#url'
    },
    'instances': {
        keyword: 'instances',
        description: 'Sets number of instances of a deployment node. Can be a static number or range (e.g. 1..3, 0..N).',
        syntax: 'instances "4" or instances "1..N"',
        link: 'https://docs.structurizr.com/dsl/language#instances'
    },

    // Relationships
    '->': {
        keyword: '->',
        description: 'Defines a uni-directional relationship between two elements. Tags: Relationship',
        syntax: '<source> -> <destination> [description] [technology]',
        link: 'https://docs.structurizr.com/dsl/language#relationship'
    },

    // Views
    'views': {
        keyword: 'views',
        description: 'Contains one or more views. If not defined, default views will be created.',
        syntax: 'views { ... }',
        link: 'https://docs.structurizr.com/dsl/language#views',
        permittedChildren: ['systemLandscape', 'systemContext', 'container', 'component', 'filtered', 'dynamic', 'deployment', 'custom', 'image', 'styles', 'theme', 'themes', 'branding', 'terminology', 'properties']
    },
    'systemLandscape': {
        keyword: 'systemLandscape',
        description: 'Defines a System Landscape view showing all people and software systems.',
        syntax: 'systemLandscape [key] [description] { ... }',
        link: 'https://docs.structurizr.com/dsl/language#systemLandscape',
        permittedChildren: ['include', 'exclude', 'autoLayout', 'default', 'animation', 'title', 'description', 'properties']
    },
    'systemContext': {
        keyword: 'systemContext',
        description: 'Defines a System Context view for a specified software system.',
        syntax: 'systemContext <softwareSystemId> [key] [description] { ... }',
        link: 'https://docs.structurizr.com/dsl/language#systemContext',
        permittedChildren: ['include', 'exclude', 'autoLayout', 'default', 'animation', 'title', 'description', 'properties']
    },
    'dynamic': {
        keyword: 'dynamic',
        description: 'Defines a Dynamic view showing relationships between elements. Scope: * (people+systems), software system, or container.',
        syntax: 'dynamic <*|softwareSystemId|containerId> [key] [description] { ... }',
        link: 'https://docs.structurizr.com/dsl/language#dynamic',
        permittedChildren: ['autoLayout', 'default', 'title', 'description', 'properties']
    },
    'deployment': {
        keyword: 'deployment',
        description: 'Defines a Deployment view for a deployment environment.',
        syntax: 'deployment <*|softwareSystemId> <environment> [key] [description] { ... }',
        link: 'https://docs.structurizr.com/dsl/language#deployment',
        permittedChildren: ['include', 'exclude', 'autoLayout', 'default', 'title', 'description', 'properties']
    },
    'filtered': {
        keyword: 'filtered',
        description: 'Defines a filtered view based on tags from a base view.',
        syntax: 'filtered <baseKey> <include|exclude> <tags> [key] [description]',
        link: 'https://docs.structurizr.com/dsl/language#filtered',
        permittedChildren: ['default', 'title', 'description', 'properties']
    },
    'custom': {
        keyword: 'custom',
        description: 'Defines a custom view. Only custom elements are permitted.',
        syntax: 'custom [key] [title] [description] { ... }',
        link: 'https://docs.structurizr.com/dsl/language#custom',
        permittedChildren: ['include', 'exclude', 'autoLayout', 'default', 'title', 'description', 'properties']
    },
    'image': {
        keyword: 'image',
        description: 'Defines an image view (PlantUML/Mermaid/Kroki). Only available on Structurizr cloud/on-premises/lite.',
        syntax: 'image <*|elementId> [key] { ... }',
        link: 'https://docs.structurizr.com/dsl/language#image',
        permittedChildren: ['default', 'title', 'description', 'properties']
    },

    // View properties
    'include': {
        keyword: 'include',
        description: 'Includes elements or relationships in a view. Use *, identifier, or expression.',
        syntax: 'include <*|identifier|expression> ...',
        link: 'https://docs.structurizr.com/dsl/language#include'
    },
    'exclude': {
        keyword: 'exclude',
        description: 'Excludes elements or relationships from a view.',
        syntax: 'exclude <identifier|expression> ...',
        link: 'https://docs.structurizr.com/dsl/language#exclude'
    },
    'autoLayout': {
        keyword: 'autoLayout',
        description: 'Enables automatic layout. Directions: tb (top-bottom), bt, lr, rl.',
        syntax: 'autoLayout [tb|bt|lr|rl] [rankSep] [nodeSep]',
        link: 'https://docs.structurizr.com/dsl/language#autoLayout'
    },
    'default': {
        keyword: 'default',
        description: 'Marks the view as the default view to be shown.',
        syntax: 'default',
        link: 'https://docs.structurizr.com/dsl/language#default'
    },
    'title': {
        keyword: 'title',
        description: 'Overrides the title of the view.',
        syntax: 'title "Title"',
        link: 'https://docs.structurizr.com/dsl/language#title'
    },
    'animation': {
        keyword: 'animation',
        description: 'Defines animation steps for a view.',
        syntax: 'animation { identifier ... }',
        link: 'https://docs.structurizr.com/dsl/language#animation'
    },

    // Styles
    'styles': {
        keyword: 'styles',
        description: 'Wrapper for element and relationship styles used when rendering diagrams.',
        syntax: 'styles { ... }',
        link: 'https://docs.structurizr.com/dsl/language#styles',
        permittedChildren: ['element', 'relationship']
    },
    'element': {
        keyword: 'element',
        description: 'Defines an element style. Properties: shape, icon, width, height, background, color, stroke, fontSize, border, opacity.',
        syntax: 'element <tag> { ... }',
        link: 'https://docs.structurizr.com/dsl/language#element'
    },
    'relationship': {
        keyword: 'relationship',
        description: 'Defines a relationship style. Properties: thickness, color, style, routing, fontSize, position, opacity.',
        syntax: 'relationship <tag> { ... }',
        link: 'https://docs.structurizr.com/dsl/language#relationship'
    },
    'shape': {
        keyword: 'shape',
        description: 'Element shape. Options: Box, RoundedBox, Circle, Ellipse, Hexagon, Cylinder, Pipe, Person, Robot, Folder, WebBrowser, MobileDevicePortrait, MobileDeviceLandscape, Component.',
        syntax: 'shape <shape>',
        link: 'https://docs.structurizr.com/dsl/language#element'
    },
    'theme': {
        keyword: 'theme',
        description: 'Specifies a theme URL or file. Use "default" for Structurizr default theme.',
        syntax: 'theme <url|file|default>',
        link: 'https://docs.structurizr.com/dsl/language#theme'
    },
    'themes': {
        keyword: 'themes',
        description: 'Specifies one or more theme URLs or files.',
        syntax: 'themes <url|file> ...',
        link: 'https://docs.structurizr.com/dsl/language#themes'
    },
    'branding': {
        keyword: 'branding',
        description: 'Defines custom branding (logo, font) for diagrams and documentation.',
        syntax: 'branding { ... }',
        link: 'https://docs.structurizr.com/dsl/language#branding'
    },
    'terminology': {
        keyword: 'terminology',
        description: 'Overrides terminology used when rendering diagrams.',
        syntax: 'terminology { ... }',
        link: 'https://docs.structurizr.com/dsl/language#terminology'
    },

    // Configuration
    'configuration': {
        keyword: 'configuration',
        description: 'Defines configuration options for the workspace.',
        syntax: 'configuration { ... }',
        link: 'https://docs.structurizr.com/dsl/language#configuration',
        permittedChildren: ['scope', 'visibility', 'users', 'properties']
    },
    'scope': {
        keyword: 'scope',
        description: 'Sets workspace scope. Options: landscape, softwaresystem, none.',
        syntax: 'scope <landscape|softwaresystem|none>',
        link: 'https://docs.structurizr.com/dsl/language#scope'
    },
    'visibility': {
        keyword: 'visibility',
        description: 'Sets workspace visibility. Options: private, public.',
        syntax: 'visibility <private|public>',
        link: 'https://docs.structurizr.com/dsl/language#visibility'
    },

    // Special commands
    '!identifiers': {
        keyword: '!identifiers',
        description: 'Modifies identifier scope mode. Options: hierarchical (default), flat.',
        syntax: '!identifiers <hierarchical|flat>',
        link: 'https://docs.structurizr.com/dsl/language#identifiers'
    },
    '!docs': {
        keyword: '!docs',
        description: 'Attaches Markdown/AsciiDoc documentation to parent context.',
        syntax: '!docs <path>',
        link: 'https://docs.structurizr.com/dsl/language#docs'
    },
    '!adrs': {
        keyword: '!adrs',
        description: 'Attaches Architecture Decision Records (ADRs) to parent context.',
        syntax: '!adrs <path>',
        link: 'https://docs.structurizr.com/dsl/language#adrs'
    },
    '!script': {
        keyword: '!script',
        description: 'Runs inline or external scripts in JVM languages (groovy, kotlin, ruby, javascript).',
        syntax: '!script <groovy|kotlin|ruby|javascript>',
        link: 'https://docs.structurizr.com/dsl/language#script'
    },
    '!plugin': {
        keyword: '!plugin',
        description: 'Runs Java plugins by fully qualified class name.',
        syntax: '!plugin <fqcn>',
        link: 'https://docs.structurizr.com/dsl/language#plugin'
    }
};
