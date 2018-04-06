sap.ui.define(
    [
        "sap/ui/base/Object", 
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator" 
    ],
    function (BaseObject,  oSAPFilter, oSAPFilterOperator) {
        "use strict";

        /**
         * @author      Christophe Taymans
         * @extends     sap.ui.base.Object
         * @name        be.infrabel.poapproval.util.FilterHelper
         * @class
         * controller 
         */
        var FilterHelper = BaseObject.extend("be.infrabel.poapproval.util.FilterHelper", {}
        );

        /**
         * Creates possible filter values for combobox filter style from given list
         * @method buildFilterModel 
         * @public
         * @instance
         * @param	    {Array}				aEntries - List of entries to calculate the remaining filters
         * @param	    {object}		    oFilterModel - filter model to update
         * @memberof be.infrabel.poapproval.util.FilterHelper
         * @author Christophe Taymans
         **/
        FilterHelper.buildFilterModel = function (aEntries, oFilterModel) {
            return new Promise(function (resolve, reject) {
                try {
                    $.each(oFilterModel.getProperty("/filters"), function (i, oFilter) {                    
                        if (oFilter.keyProperty && oFilter.valueProperty) {
                            //Extract all unique values 
                            oFilter.entries = this.getUniqueValues(aEntries, oFilter.keyProperty, oFilter.valueProperty);
                            //Check if there are possible values
                            oFilter.visible = oFilter.entries.length > 0 ? true : false;
                            //Insert an 'empty' line 
                            oFilter.entries.splice(0, 0, {
                                key: "NONE",
                                value: ""
                            });
                        }
                    }.bind(this));
                    resolve(oFilterModel);
                } catch (e) {
                    reject(e);
                }
            }.bind(this));
        };

        /**
         * Filter value changed
         * apply new filtering criteria to the list
         * @method onFilterValueChanged
         * @public
         * @instance
         * @param	    {object}		    oFilterModel - filter model to update
         * @memberof be.infrabel.poapproval.util.FilterHelper
         * @author Christophe Taymans
         **/
        FilterHelper.BuildSearchFilters = function (oFilterModel) {
            return new Promise(function (resolve, reject) {
                var aSelectionFilters = [];
                var aValueFilters = [];
                var aFreeSearchFilters = [];
                var oFilter = new oSAPFilter({
                    filters: [],
                    and: true
                });
                var sFreeSearch = ("" + oFilterModel.getProperty("/freeSearch/value")).toLowerCase();
                try {
                    // Add a model filter for each filter selected in a drop down box
                    $.each(oFilterModel.getProperty("/filters"), function (i, oFilter) {
                        if (oFilter.key && oFilter.key !== "NONE") {
                            aSelectionFilters.push(new oSAPFilter({
                                path: oFilter.keyProperty.replace(/\./g, "/"),
                                operator: oSAPFilterOperator.EQ,
                                value1: oFilter.key
                            }));
                        }

                    });
                    // Add a model filter for each vulue filter
                    $.each(oFilterModel.getProperty("/valueSearch"), function (i, oFilter) {
                        if (oFilter.valueLow) {

                            if (!oFilter.operator) {
                                oFilter.operator = oSAPFilterOperator.EQ;
                            }

                            aValueFilters.push(new oSAPFilter({
                                path: oFilter.keyProperty.replace(/\./g, "/"),
                                operator: oFilter.operator,
                                value1: oFilter.valueLow,
                                value2: oFilter.valueHigh
                            }));
                        }
                    });
                    //free search
                    if (sFreeSearch !== "") {
                        $.each(oFilterModel.getProperty("/freeSearch/filters"), function (i, sFilter) {
                            aFreeSearchFilters.push(new oSAPFilter({
                                path: sFilter.replace(/\./g, "/"),
                                test: function (oValue) {
                                    var bMatch = ("" + oValue).toLowerCase().includes(sFreeSearch);
                                    return bMatch;
                                }
                            }));
                        }.bind(this));
                    }
                    // combine all filter types...
                    if (aSelectionFilters.length) {
                        oFilter.aFilters.push(new oSAPFilter({
                            filters: aSelectionFilters,
                            and: true
                        }));
                    }
                    if (aFreeSearchFilters.length) {
                        oFilter.aFilters.push(new oSAPFilter({
                            filters: aFreeSearchFilters,
                            and: false
                        }));
                    }
                    if (aValueFilters.length) {
                        oFilter.aFilters.push(new oSAPFilter({
                            filters: aValueFilters,
                            and: false
                        }));
                    }
                    if (oFilter && oFilter.aFilters.length === 0) {
                        oFilter = null;
                    }
                    resolve(oFilter);
                } catch (e) {
                    reject(e);
                }
            }.bind(this))
        };

        /**
         * Filter reset
         * @method resetFilters
         * @public
         * @instance
         * @param	    {object}		    oFilterModel - filter model to update
         * @memberof be.infrabel.poapproval.util.FilterHelper
         * @author Christophe Taymans
         **/
        FilterHelper.resetFilters = function (oFilterModel) {
            //reset each filter selected in a drop down box
            $.each(oFilterModel.getProperty("/filters"), function (i, oFilter) {
                oFilter.key = "NONE"
            });
            // reset filter for each vulue filter
            $.each(oFilterModel.getProperty("/valueSearch"), function (i, oFilter) {
                oFilter.value = "";
            });
            //reset free search               
            oFilterModel.setProperty("/freeSearch/value", "");
            oFilterModel.updateBindings(true);
        };

        /**
         * build a set of agregated value from a given column of a list
         * @method getUniqueValues
         * @public
         * @instance
         * @param	    {object}		aObjects - list 
         * @param	    {value}		    sKeyProperty - column to agrregate
         * @param	    {value}		    sValueProperty - value to push oj the aggreagted column
         * @memberof be.infrabel.poapproval.util.FilterHelper
         * @author Christophe Taymans
         **/
        FilterHelper.getUniqueValues = function (aObjects, sKeyProperty, sValueProperty) {
            try {
                var unique = {},
                    distinct = [];

                function index(obj, i) {
                    return obj[i];
                }
                for (var i in aObjects) {
                    if (typeof (unique[sKeyProperty.split(".").reduce(index, aObjects[i])]) === "undefined" && sKeyProperty.split(".").reduce(index, aObjects[i])) {
                        distinct.push({
                            key: sKeyProperty.split(".").reduce(index, aObjects[i]),
                            value: sValueProperty.split(".").reduce(index, aObjects[i])
                        });
                    }
                    unique[sKeyProperty.split(".").reduce(index, aObjects[i])] = 0;
                }
                return distinct;
            } catch (e) {     
            }
        };

        return FilterHelper;
    }
);