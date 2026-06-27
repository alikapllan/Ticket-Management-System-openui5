sap.ui.define(function() {
    "use strict";

    return {
        name: "QUnit test suite for tmui5",
        defaults: {
            page: "ui5://test-resources/tmui5/test/Test.qunit.html?testsuite={suite}&test={name}",
            qunit: {
                version: 2
            },
            sinon: {
                version: 4
            },
            ui5: {
                theme: "sap_horizon"
            },
            loader: {
                paths: {
                    "tmui5": "../"
                }
            },
            coverage: {
                only: ["tmui5"],
                never: ["tmui5/test"]
            }
        },
        tests: {
            // ----- Unit Tests -----
            "unit/unitTests": {
                title: "Unit Tests"
            },
            // ----- OPA Integration Tests -----
            "integration/FirstJourney": {
                title: "First Journey"
            }
        }
    };
});