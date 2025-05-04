sap.ui.define([], function () {
  "use strict";
  return {
    validateTextAreaLength: function (oEvent, oControllerInstance) {
      const oTextArea = oEvent.getSource(),
        iValueLength = oTextArea.getValue().length,
        iMaxLength = oTextArea.getMaxLength(),
        sState =
          iValueLength > iMaxLength
            ? oControllerInstance.ValueState.Error
            : oControllerInstance.ValueState.None;

      oTextArea.setValueState(sState);
    },
  };
});
