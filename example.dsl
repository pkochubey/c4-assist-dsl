workspace "Example Workspace" "This is an example Structurizr DSL file" {

    !include ./additional.dsl

    model {
        user = person "User"
        admin = person "Admin"

        softwareSystem = softwareSystem "My Software System" "Description" {
            webApp = container "Web Application" "Description" "Technology" {
                componentController = component "Controller" "Description" "Technology"
                componentService = component "Service" "Description" "Technology"
            }

            database = container "Database" "Description" "Technology"
        }

        user -> softwareSystem "Uses"
        admin -> softwareSystem "Administers"
        softwareSystem -> database "Reads from and writes to"
    }

    views {
        systemLandscape {
            include *
            autoLayout tb
        }

        systemContext softwareSystem "SystemContext" "Description" {
            include *
            autoLayout lr
        }

        container softwareSystem "Containers" "Description" {
            include *
            autoLayout tb
        }

        component webApp "Components" "Description" {
            include *
            autoLayout tb
        }

        styles {
            element "Software System" {
                shape RoundedBox
                background #1168bd
                color #ffffff
            }
            element "Person" {
                shape Person
            }
            element "Container" {
                shape Cylinder
            }
        }
    }

    configuration {
        scope softwaresystem
        visibility private
    }
}
