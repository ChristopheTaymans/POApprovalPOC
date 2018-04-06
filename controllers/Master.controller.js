sap.ui.define(
	["be/infrabel/poapproval/controllers/BaseController",
		"sap/ui/model/json/JSONModel",
		'sap/ui/model/Filter',
		"sap/ui/Device",
		"be/infrabel/poapproval/util/FilterHelper"
	],
	function (BaseController, SAPJsonModel, Filter, Device, FilterHelper) {
		"use strict";
		/**
		 * @author      Christophe Taymans
		 * @extends     be.infrabel.sap.mobile.workmanager.core.ui.BaseMVCController
		 * @name        be.infrabel.poapproval.controllers.Master
		 * @class
		 * controller 
		 */
		var controller = BaseController.extend("be.infrabel.poapproval.controllers.Master", {

			_onListUpdateFinished: function (oEvent) {
				this.setInfo("actualCount", oEvent.getParameter("actual"));
				this.setInfo("totalCount", oEvent.getParameter("total"));

			},

			onInitialRouteMatched: function (oEvent) {
				// if (this.getOwnerComponent().InitialLoaded != true) {
				// 	this._loadData()
				// };
			},

			_loadData: function () {
				var oModel = this.getOwnerComponent().getModel();
				var oViewModel = new SAPJsonModel();
				this.setBusy(true);
				this.getOwnerComponent().InitialLoaded = true;
				oModel.read("/POInfoSet", {
					async: true,
					success: function (oData, oResponse) {
						this.getView().byId("pullToRefresh").hide();
						this.setBusy(false);
						oViewModel.setData(oData.results);
						this.setModel(oViewModel, "WI");

						//Build filter model Vs entry in  set			
						FilterHelper.buildFilterModel(this.getModel().getProperty('/'), this.getModel("filters"))
							.then(function () {
								oFilterModel.refresh();
							}.bind(this))
							.catch(function (oError) {}.bind(this));


					}.bind(this),
					error: function (oError) {
						this.setBusy(false);
					}
				});
			},

			onSuccessRouteMatched: function (oEvent) {
				if (this.getOwnerComponent().InitialLoaded != true) {
					this.getRouter().navTo("initialRoute");
					return;
				}
				var oModel = this.getModel('WI');
				var sPoId = oEvent.getParameter("arguments").PoId;
				var sIndex = oModel.oData.findIndex(function (currentValue, index, arr) {
					return currentValue.Ebeln == sPoId;
				}, this);
				oModel.oData.splice(sIndex, 1);
				oModel.setData(oModel.oData);
			},

			_onItemPress: function (oEvent) {
				var sPath = oEvent.getParameter("listItem").getBindingContext("WI").getPath();
				var oPo = this.getModel('WI').getProperty(sPath);
				sPath = "/POInfoSet('" + oPo.Ebeln + "')";
				this.getRouter().navTo(
					"detailRoute", {
						path: sPath.substr(1)
					}
				)
			},

			handleRefresh: function () {
				this._loadData();
			}
		});


		/**
		 * called at controler initialisation
		 * @method onInit
		 * @public
		 * @instance
		 * @redefine (optional)
		 * @memberof be.infrabel.poapproval.controllers.Master
		 * @author Christophe Taymans
		 **/

		controller.prototype.onInit = function () {
			this.getRouter().getRoute("initialRoute").attachPatternMatched(this.onInitialRouteMatched, this);
			this.getRouter().getRoute("successRoute").attachPatternMatched(this.onSuccessRouteMatched, this);

			if (Device.support.touch) {
				var bar = this.getView().byId("searchBar");
				var page = this.getView().byId("page");
				page.insertAggregation("content", bar, 1);
			}
			this.getOwnerComponent().getModel().attachEventOnce("metadataLoaded", this._loadData,this);
		};

		/**
		 * Rendering of the view is completed
		 * @method onAfterRendering
		 * @public
		 * @instance    
		 * @memberof be.infrabel.poapproval.controllers.Master
		 * @author Christophe Taymans
		 **/
		controller.prototype.onAfterRendering = function () {
			if (!this.oTable) {
				this.oTable = this.byId("lstPO");
			}
		};
		/**
		 * View is destroyed
		 * destroy fragements
		 * @method onExit
		 * @public
		 * @instance
		 * @memberof be.infrabel.poapproval.controllers.Master
		 * @author Christophe Taymans
		 **/
		controller.prototype.onExit = function () {
			if (this._searchDialog) {
				this._searchDialog.destroy();
			}
			if (this._sortDialog) {
				this._sortDialog.destroy();
			}
		};

		//* filtering methods

		/**
		 * Handler function when the user presses the filter button
		 * @method onFilterPressed
		 * @public
		 * @instance
		 * @param {event} oEvent
		 * @memberof be.infrabel.poapproval.controllers.Master
		 * @author Christophe Taymans
		 **/
		controller.prototype.onFilterPressed = function (oEvent) {
			if (!this._searchDialog) {
				this._searchDialog = sap.ui.xmlfragment("be.infrabel.poapproval.views.SearchDialog", this);
				this.getView().addDependent(this._searchDialog);
			}
			this._searchDialog.open();
		};

		/**
		 * Filter value changed
		 * apply new filtering criteria to the list
		 * @method onFilterValueChanged
		 * @public
		 * @instance
		 * @memberof be.infrabel.poapproval.controllers.Master
		 * @author Christophe Taymans
		 **/
		controller.prototype.onFilterValueChanged = function () {
			// apply the filter
			var oFilterModel = this.getModel("filters");

			FilterHelper.BuildSearchFilters(oFilterModel)
				.then(function (oFilter) {
					//refresh the table filter
					this.oTable.getBinding("items").filter(oFilter, "application");

					if (!!oFilter) {
						this.byId('filterButton').setType("Emphasized");
					} else {
						this.byId('filterButton').setType("Default");
					}
				}.bind(this))
				.catch(function (oError) {

				}.bind(this))
		};

		/**
		 * Clears the filter values entered by the user
		 * @method onFilterRefreshButtonPressed
		 * @public
		 * @instance
		 * @param    {sap.ui.base.Event}   oEvent* 
		 * @memberof be.infrabel.poapproval.controllers.Master
		 * @author Christophe Taymans
		 **/
		controller.prototype.onFilterRefreshButtonPressed = function (oEvent) {
			FilterHelper.resetFilters(this.getModel("filters"));
		};

		/**
		 * Applies the filters to the list and closes searchdialog
		 * copy filter state
		 * @method onFilterOkButtonPressed
		 * @public
		 * @instance
		 * @param    {sap.ui.base.Event}   oEvent
		 * @memberof be.infrabel.poapproval.controllers.Master
		 * @author Christophe Taymans
		 **/
		controller.prototype.onFilterOkButtonPressed = function (oEvent) {
			// make a copy of the filter state in order to be able to restore it in case of filter modification cancelling       
			this.filterCopy = $.extend(true, {}, this.getModel("filters").getProperty('/'));
			this.onFilterValueChanged();
			this._searchDialog.close();
		};

		/**
		 * Cancel the filter dialog
		 * Restore the filter from copy
		 * @method onFilterCancelButtonPressed
		 * @public
		 * @instance
		 * @param    {sap.ui.base.Event}   oEvent
		 * @memberof be.infrabel.poapproval.controllers.Master
		 * @author Christophe Taymans
		 **/
		controller.prototype.onFilterCancelButtonPressed = function (oEvent) {
			this._searchDialog.close();
			// if exists, restore the filter has it was before to open the filter dialog
			if (this.filterCopy) {
				this.getModel("filters").setProperty("/", this.filterCopy);
			}
		};


		// 	// onSupplierSearch: function (oEvt) {
		// 	// 	// add filter for search
		// 	// 	var aFilters = [];
		// 	// 	var sQuery = oEvt.getSource().getValue();
		// 	// 	if (sQuery && sQuery.length > 0) {
		// 	// 		var filter = new Filter("Name1", sap.ui.model.FilterOperator.Contains, sQuery);
		// 	// 		aFilters.push(filter);
		// 	// 	};
		// 	// 	// update list binding
		// 	// 	var list = this.getView().byId("lstPO");
		// 	// 	var binding = list.getBinding("items");
		// 	// 	binding.filter(aFilters, "Application");
		// 	// },

		return controller;

	});