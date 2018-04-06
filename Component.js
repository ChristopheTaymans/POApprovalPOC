sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"be/infrabel/poapproval/controllers/ErrorHandler",
	"sap/ui/model/FilterOperator",
	"sap/ui/Device"
], function (UIComponent, SAPJsonModel, ErrorHandler, FilterOperator, Device) {
	"use strict";
	
	$.sap.declare("be.infrabel.poapproval.Component");

	var appComponent = UIComponent.extend("be.infrabel.poapproval.Component", {

		metadata: {
			manifest: "json"
		},


		events: {
			"someEvent": {
				/**
				 * <someEvent description goes here. You can use basic HTML>
				 * @event #someEvent
				 * @type {object}
				 * @property {string} someParameter - property description no commas
				 * @memberof be.infrabel.sap.mobile.workmanager.DocumentationTemplate
				 **/
				parameters: [{
					name: "someParameter"
				}]
			}
		},

		/**
		 * <Constructor description goes here, Basic HTML allowed>
		 * @constructs be.infrabel.sap.mobile.workmanager.DocumentationTemplate
		 * @param {someType} someParam - paramdescription no commas
		 * @public
		 * @memberof be.infrabel.sap.mobile.workmanager.DocumentationTemplate
		 * @author <Developer Name>, <Developer2 name>, ...
		 **/
		constructor: function () {
			// call the base component's constructor function
			UIComponent.apply(this, arguments);
		},
		/**
		 * <Destroy description goes here, Basic HTML allowed>
		 * @constructs be.infrabel.sap.mobile.workmanager.DocumentationTemplate
		 * @param {someType} someParam - paramdescription no commas
		 * @public
		 * @memberof be.infrabel.sap.mobile.workmanager.DocumentationTemplate
		 * @author <Developer Name>, <Developer2 name>, ...
		 **/
		destroy: function () {
			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
		}
	});

	appComponent.prototype.init = function () {

			// initialize the error handler with the component
			this._oErrorHandler = new ErrorHandler(this);
			this.setModel(new SAPJsonModel(), "Info");
			this.InitialLoaded = false;

			var oAppModel = new SAPJsonModel({
				busy: true,
				delay: 0,
				itemToSelect: null,
				addEnabled: false
			});

			this.setModel(oAppModel, "appView");

			var oDeviceModel = new SAPJsonModel(Device);
			oDeviceModel.setDefaultBindingMode("OneWay");
			this.setModel(oDeviceModel, "DEVICE");

			// build filter model
			var oFilterModel = new SAPJsonModel({
				freeSearch: {
					value: "",
					// Fields on which the free search applies
					filters: []
				},
				valueSearch: {
					poIdSearch: {
						keyProperty: "Ebeln",
						operator: FilterOperator.Contains,
						valueLow: ""
					},
					priceSearch: {
						keyProperty: "Netwr",
						operator: FilterOperator.BT,
						valueLow: "",
						valueHigh: ""
					},
				},
				filters: {
					requester: {
						key: "NONE",
						entries: "",
						visible: false,
						keyProperty: "Ernam",
						valueProperty: "Fullname"
					},
					supplier: {
						key: "NONE",
						entries: "",
						visible: true,
						keyProperty: "Lifnr",
						valueProperty: "Name1"
					},
					company: {
						key: "NONE",
						entries: "",
						visible: true,
						keyProperty: "Bukrs",
						valueProperty: "Butxt"
					}
				}
			});

			this.setModel(
				oFilterModel, "filters"
			);

			UIComponent.prototype.init.apply(this, arguments);
			// create the views based on the url/hash
			this.getRouter().initialize();

		},

		appComponent.prototype.destroy = function () {

			this._oErrorHandler.destroy();
			// call the base component's destroy function
			SAPUiComponent.prototype.destroy.apply(this, arguments);
		};

	/**
	 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
	 * design mode class should be set, which influences the size appearance of some controls.
	 * 
	 * @public
	 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
	 */
	appComponent.prototype.getContentDensityClass = function () {
		if (this._sContentDensityClass === undefined) {
			// check whether FLP has already set the content density class; do nothing in this case
			if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
				this._sContentDensityClass = "";
			} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
				this._sContentDensityClass = "sapUiSizeCompact";
			} else {
				// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
				this._sContentDensityClass = "sapUiSizeCozy";
			}
		}
		return this._sContentDensityClass;
	}

	return appComponent;

});