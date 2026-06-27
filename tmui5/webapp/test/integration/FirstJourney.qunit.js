sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"./OpaSetup"
], function(Opa5, opaTest) {
	"use strict";

	QUnit.module("MainView");

	opaTest("Should have correct title", function(Given, When, Then) {
		// Arrangements
		Given.iStartMyUIComponent({
			componentConfig: {
				name: "tmui5",
				async: true
			},
			hash: ""
		});

		// Assertions
		Then.onTheMainViewPage.theTitleShouldBeCorrect();

		// Cleanup
		Then.iTeardownMyApp();
	});

});
