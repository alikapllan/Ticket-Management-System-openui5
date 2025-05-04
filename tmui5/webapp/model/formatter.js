sap.ui.define(["sap/ui/core/format/DateFormat"], function (DateFormat) {
  "use strict";

  return {
    formatDateTime: function (sDate) {
      if (!sDate) {
        return "";
      }

      const oDate = new Date(sDate); // Convert ISO string to Date object

      const oDateFormat = DateFormat.getDateTimeInstance({
        pattern: "dd/MM/yyyy HH:mm",
      });

      return oDateFormat.format(oDate);
    },

    getStatusState: function (sTicketStatusName) {
      if (!sTicketStatusName) {
        return this.ValueState.None; // Default state if status is missing
      }

      const oResourceBundle = this.getOwnerComponent()
        .getModel("i18n")
        .getResourceBundle();

      switch (sTicketStatusName) {
        case oResourceBundle.getText("statusNew"):
          return this.ValueState.Information;
        case oResourceBundle.getText("statusInPlanning"):
          return this.ValueState.Warning;
        case oResourceBundle.getText("statusInProgress"):
          return this.ValueState.Success;
        case oResourceBundle.getText("statusWaitingForCustomerFeedback"):
          return this.ValueState.Warning;
        case oResourceBundle.getText("statusOnHold"):
          return this.ValueState.None;
        case oResourceBundle.getText("statusCanceled"):
          return this.ValueState.Error;
        case oResourceBundle.getText("statusDone"):
          return this.ValueState.Success;
        default:
          return this.ValueState.None;
      }
    },
  };
});
