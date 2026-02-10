import { LightningElement, wire } from "lwc";
import { CurrentPageReference } from "lightning/navigation";
import { CloseActionScreenEvent } from "lightning/actions";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class FlightApiNew extends LightningElement {
  recordId;
  _screenState = "dataScreen";
  flightType = "return";
  selectedFlightSummary;
  selectedFlightId;
  passengerData;
  flightsResult;
  isLoading = false;

  get screenState() {
    return {

      dataScreen: this._screenState === "dataScreen",
      confirmationScreen: this._screenState === "confirmationScreen",
    };
  }

  set screenState(value) {
    const validStates = ["dataScreen", "confirmationScreen"];
    if (validStates.includes(value)) {
      this._screenState = value;
    } else {
      throw new Error(`Invalid screen state: ${value}`);
    }
  }

  get disableNext() {
    const { dataScreen } = this.screenState;

    return (
  
      (dataScreen && !this.selectedFlightId) ||
      this.isLoading
    );
  }

  get modalHeader() {

    if (this.screenState.dataScreen) {
      return "Vluchtgegevens";
    }
    return "Bevestiging";
  }

  get itineraryServiceDay() {
    return this.flightType === "stopover"
      ? this.passengerData?.originDestinations[0].flightDate
      : this.passengerData?.initialDepartureDate;
  }

  @wire(CurrentPageReference)
  getStateParameters(currentPageReference) {
    if (currentPageReference) {
      this.recordId = currentPageReference.state.recordId;
    }
  }

  connectedCallback() {
    window.addEventListener("selectflightoption", (event) => {
      this.handleSetFlight(event);
    });
  }

  closeModal() {
    this.dispatchEvent(new CloseActionScreenEvent());
  }

  handleBack() {


    if (this.screenState.confirmationScreen) {
      this.screenState = "dataScreen";
    }
  }

  handleNext() {


    if (this.screenState.dataScreen) {
      this.screenState = "confirmationScreen";
    }
  }

  async handleConfirm(event) {
    this.isLoading = true;
    const type = event.target.dataset.type;

    try {
      await this.handleCreateFlights();
      this.showToast("Success", "Vlucht is succesvol toegevoegd", "success");
      this.dispatchEvent(
        new CustomEvent("refetchData", { bubbles: true, composed: true }),
      );

      if (type === "close") {
        this.closeModal();
      }

      if (type === "new") {
        this.handleResetFlights();
        this.flightType = null;
        this.passengerData = null;
        this.screenState = "dataScreen";
      }
    } catch (error) {
      console.error("Error confirming flight: ", error);
      const errorMessage = error.body.message || error.message;

      if (
        errorMessage.includes("INVALID_OR_NULL_FOR_RESTRICTED_PICKLIST") &&
        errorMessage.includes("Airline__c")
      ) {
        this.showToast(
          "Error",
          "De vliegmaatschappij is niet actief voor het recordtype 'Flight' op ItineraryOption__c. Activeer deze in de setup.",
          "error",
        );
      } else {
        this.showToast("Error", errorMessage, "error");
      }
    }

    this.isLoading = false;
  }

  async handleCreateFlights() {
    // Mock flight creation — in production this would call an Apex method
    // to persist the selected flight to the database
    return Promise.resolve();
  }

  handleFlightTypeChange(event) {
    this.handleResetFlights();
    this.flightType = event.detail;
    this.passengerData = null;
  }

  handleSetFlightsResult(event) {
    this.flightsResult = event.detail;
  }

  handlePassengerData(event) {
    this.passengerData = event.detail;
  }

  handleSetFlight(event) {
    this.selectedFlightId = event.detail.id;
    this.selectedFlightSummary = event.detail;
  }

  handleResetFlights() {
    this.selectedFlightSummary = undefined;
    this.selectedFlightId = undefined;
    this.flightsResult = undefined;
  }

  showToast(title, message, variant) {
    const event = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant,
    });
    this.dispatchEvent(event);
  }
}
