import { LightningElement, api } from "lwc";

export default class FlightApiTypeSelector extends LightningElement {
  @api itineraryId;
  @api flightType;
  existingFlights = [];
  isLoading = false;
  adultCount = 1;

  get options() {
    const defaultOption = { label: "Retourvlucht", value: "return" };
    const alternativeOption = {
      label: "Alternatieve retourvlucht",
      value: "alternativeReturn",
    };
    const stopoverOption = { label: "Tussenvlucht", value: "stopover" };
    const multiCityOption = { label: "Meerdere steden", value: "multiCity" };

    return this.existingFlights.length > 1
      ? [alternativeOption, multiCityOption, stopoverOption]
      : [defaultOption, multiCityOption];
  }

  get showPassengerLimitWarning() {
    return this.adultCount > 9;
  }

  get disabled() {
    return this.showPassengerLimitWarning || this.isLoading;
  }

  connectedCallback() {
    // Default passenger count for mock
    this.adultCount = 2;
    this.existingFlights = [];
    this.isLoading = false;

    window.addEventListener("refetchData", () => {
      this.refetchData();
    });
  }

  handleTypeChange(event) {
    // eslint-disable-next-line @lwc/lwc/no-api-reassignments
    this.flightType = event.detail.value;

    this.dispatchEvent(
      new CustomEvent("flighttypechange", {
        detail: this.flightType,
      }),
    );
  }

  refetchData() {
    return Promise.resolve();
  }
}
