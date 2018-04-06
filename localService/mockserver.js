sap.ui.define([
	"sap/ui/core/util/MockServer"
], function (MockServer) {
	"use strict";
	return {
		init: function () {
			// create
			var oMockServer = new MockServer({
				rootUri: "" //@todo: here you need to provide the URL of the service for which are implementing the mockserver handling (see manifest datasource)
			}); 
			var oUriParameters = jQuery.sap.getUriParameters();
			// configure
			MockServer.config({
				autoRespond: true,
				autoRespondAfter: oUriParameters.get("serverDelay") || 1000
			});
			// simulate
			var sPath = jQuery.sap.getModulePath("<yournamespace>.localService"); //@todo: provide your app namespace here
			oMockServer.simulate(sPath + "/metadata.xml", sPath + "/mockdata");
			// start
			oMockServer.start();
		}
	};
});