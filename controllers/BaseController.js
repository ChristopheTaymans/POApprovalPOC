/*global history */
sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("be.infrabel.poapproval.controllers.BaseController", {
		/**
		 * Convenience method for accessing the router in every controller of the application.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},

		/**
		 * Convenience method for getting the view model by name in every controller of the application.
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model in every controller of the application.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Convenience method for getting the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getText: function (fTextId, fArgs) {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(fTextId, fArgs);
		},

		setBusy: function (bState) {
			this.getOwnerComponent().getModel("appView").setProperty("/busy", bState);
			this.getOwnerComponent().getModel("appView").setProperty("/delay",0);
			//this.getView().setBusy(bState);
		},
		
		setInfo:function(sProperty,sValue){
			this.getOwnerComponent().getModel("Info").setProperty("/"+sProperty, sValue);
		},
		
		getInfo:function(sProperty){
			return this.getOwnerComponent().getModel("Info").getProperty("/"+sProperty);
		}

	});

});