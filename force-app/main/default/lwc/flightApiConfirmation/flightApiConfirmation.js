import { LightningElement, api } from "lwc";

export default class FlightApiConfirmation extends LightningElement {
  @api selectedFlightSummary;
  @api passengerData;
  @api isLoading = false;

  get departureDate() {
    const originDest = this.passengerData?.originDestinations;
    if (originDest && originDest.length > 0) {
      return this.formatDate(originDest[0].flightDate) || "";
    }
    return "";
  }

  get returnDate() {
    const originDest = this.passengerData?.originDestinations;
    if (!originDest || originDest.length <= 1) {
      return false;
    }
    return this.formatDate(originDest[originDest.length - 1].flightDate) || "";
  }

  get checkedBagsIncluded() {
    return (
      (this.selectedFlightSummary?.holdLuggageUnits || 0) > 0 ||
      (this.selectedFlightSummary?.holdLuggageWeight || 0) > 0
    );
  }

  get departureAirport() {
    return this.selectedFlightSummary?.departureLocation || "";
  }

  get destinationAirport() {
    return this.selectedFlightSummary?.arrivalLocation || "";
  }

  get flights() {
    if (!this.selectedFlightSummary?.flights) return [];
    return this.selectedFlightSummary.flights.map((flight) => {
      return {
        ...flight,
        formattedDepartureDate: this.formatDate(
          flight.departureFlightDepartureDate,
        ),
        firstItem: this.selectedFlightSummary.flights.indexOf(flight) === 0,
      };
    });
  }

  get flightType() {
    const count = this.passengerData?.originDestinations?.length || 1;
    return {
      oneway: count === 1,
      roundtrip: count === 2,
      multicity: count > 2,
    };
  }

  formatDate(date) {
    if (!date) return "";
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    const formattedDate = new Date(date).toLocaleDateString("nl-NL", options);
    return formattedDate;
  }
}
