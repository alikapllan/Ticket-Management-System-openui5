sap.ui.define(
  [
    "tmui5/controller/BaseController",
    "sap/ui/core/routing/History",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/f/GridList",
    "sap/f/GridListItem",
    "sap/m/VBox",
    "sap/m/Title",
    "sap/m/Label",
    "sap/ui/core/dnd/DragInfo",
    "sap/f/dnd/GridDropInfo",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "tmui5/services/ticketStatusService",
    "sap/ui/core/CustomData",
    "tmui5/services/ticketService",
  ],
  function (
    BaseController,
    History,
    Filter,
    FilterOperator,
    GridList,
    GridListItem,
    VBox,
    Title,
    Label,
    DragInfo,
    GridDropInfo,
    MessageBox,
    MessageToast,
    JSONModel,
    ticketStatusService,
    CustomData,
    ticketService
  ) {
    "use strict";

    return BaseController.extend("tmui5.controller.KanbanView", {
      onInit: async function () {
        // Call the BaseController's onInit to initialize to be able to use 'oBundle'
        BaseController.prototype.onInit.apply(this, arguments);

        // ensuring Ticket and Ticket Stasus models are loaded
        await this._ensureModelsLoaded();

        const aStatuses = this._getStatusModel().getData();

        this._renderColumnsForEachTicketStatus(aStatuses);
      },

      _ensureModelsLoaded: async function () {
        // Fetch again if necessary

        const modelHasData = (model) =>
          model &&
          typeof model.getData === "function" &&
          model.getData().length > 0;

        let oTicketModel = this._getTicketModel();
        let oStatusModel = this._getStatusModel();

        if (!modelHasData(oTicketModel)) {
          await this.loadTickets();
        }

        if (!modelHasData(this._getTicketModel())) {
          MessageBox.error(this.oBundle.getText("MBoxNoTicketsAvaliable"));
          return;
        }

        if (!modelHasData(oStatusModel)) {
          try {
            const aStatuses = await ticketStatusService.fetchTicketStatuses();
            oStatusModel = new JSONModel(aStatuses);
            this.getOwnerComponent().setModel(
              oStatusModel,
              "ticketStatusModel"
            );
          } catch (error) {
            MessageBox.error(
              this.oBundle.getText("MBoxGETReqFailedOnTicketStatus")
            );
            console.error(error);
          }
        }
      },

      _getTicketModel: function () {
        return this.getOwnerComponent().getModel("ticketModel");
      },
      _getStatusModel: function () {
        return this.getOwnerComponent().getModel("ticketStatusModel");
      },

      _renderColumnsForEachTicketStatus: function (aStatuses) {
        const oContainer = this.byId("cssGridContainer");
        oContainer.removeAllItems();
        aStatuses.forEach((oStatus) => {
          oContainer.addItem(this._createColumnEntryForEachTicket(oStatus));
        });
      },

      _createColumnEntryForEachTicket: function (oStatus) {
        const oGridList = new GridList({
          headerText: oStatus.ticketStatusName,
          // showNoData: false,
          // customData is used to capture to which status ticket is moved
          customData: [
            new CustomData({
              key: "ticketStatusId",
              value: oStatus.ticketStatusId,
            }),
          ],
          items: {
            path: "ticketModel>/",
            filters: [
              new Filter(
                "ticketStatusId",
                FilterOperator.EQ,
                oStatus.ticketStatusId
              ),
            ],
            template: new GridListItem({
              type: "Active",
              content: [
                new VBox({
                  alignItems: "Center",
                  justifyContent: "Center",
                  height: "100%",
                  items: [
                    new Title({
                      text: "{ticketModel>ticketId}",
                      wrapping: true,
                      textAlign: "Center",
                    }),
                    new Label({
                      text: "{ticketModel>title}",
                      wrapping: true,
                      textAlign: "Center",
                    }),
                  ],
                }),
              ],
            }),
          },
        });

        // drag‑and‑drop configuration
        oGridList.addDragDropConfig(
          new DragInfo({ sourceAggregation: "items" })
        );
        oGridList.addDragDropConfig(
          new GridDropInfo({
            targetAggregation: "items",
            dropPosition: "OnOrBetween",
            dropLayout: "Horizontal",
            drop: this._onDrop.bind(this),
          })
        );

        return oGridList;
      },

      _onDrop: async function (oEvent) {
        const oDraggedItem = oEvent.getParameter("draggedControl");
        const oDroppedList = oEvent.getSource().getParent();

        const oDraggedBindingContext =
          oDraggedItem.getBindingContext("ticketModel");
        const oDraggedData = oDraggedBindingContext.getObject();

        const sNewStatusId = oDroppedList
          .getCustomData()
          .find((d) => d.getKey() === "ticketStatusId")
          .getValue();

        if (!sNewStatusId || oDraggedData.ticketStatusId === sNewStatusId) {
          return; // no status change
        }

        const aTickets = this.getOwnerComponent()
          .getModel("ticketModel")
          .getData();
        const oTicket = aTickets.find(
          (t) => t.ticketId === oDraggedData.ticketId
        );

        if (oTicket && oTicket.ticketStatusId !== sNewStatusId) {
          oTicket.ticketStatusId = sNewStatusId;

          // Prepare payload to update ticket status
          const oPayload = {
            ticketTypeId: oTicket.ticketTypeId,
            teamMemberId: oTicket.teamMemberId,
            customerId: oTicket.customerId,
            ticketStatusId: oTicket.ticketStatusId,
            title: oTicket.title,
            description: oTicket.description,
          };

          try {
            const oUpdatedTicketResponse = await ticketService.updateTickets(
              parseInt(oTicket.ticketId),
              oPayload
            );

            if (oUpdatedTicketResponse) {
              // await this.loadTickets();
              const sTicketStatusText = this.getOwnerComponent()
                .getModel("ticketModel")
                .getData()
                .find(
                  (t) => t.ticketId === oUpdatedTicketResponse.ticketId
                ).ticketStatusName;
              MessageToast.show(
                this.oBundle.getText("MToastTicketSuccesfullyMovedToStatus", [
                  oUpdatedTicketResponse.ticketId,
                  sTicketStatusText,
                ])
              );

              // see changes reflecting on UI -> forces model to notify all bindings that data has changed
              this.getOwnerComponent().getModel("ticketModel").refresh(true);
            }
          } catch (error) {
            console.error(error);
            MessageBox.error(
              this.oBundle.getText("MBoxFailedToUpdateTicketStatus")
            );
          }
        }
      },

      onNavBack: function () {
        const oHistory = History.getInstance();
        const sPreviousHash = oHistory.getPreviousHash();

        if (sPreviousHash !== undefined) {
          window.history.go(-1);
        } else {
          this.navTo(this.Constants.ROUTES.MAIN);
        }
      },
    });
  }
);
