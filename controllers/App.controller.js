sap.ui.define([
	"be/infrabel/poapproval/controllers/BaseController",
	"be/infrabel/poapproval/model/formatter",
	"sap/ui/model/json/JSONModel"
], function(BaseController, Formatter, JSONModel) {
	"use strict";

	return BaseController.extend("be.infrabel.poapproval.controllers.App", {

		onInit: function() {
			this.formatter = Formatter;

			// apply content density mode to root view
			this.getOwnerComponent().getModel().metadataLoaded().then(this.setBusy(false));
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		}
	});
});