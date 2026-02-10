import { LightningElement, api, wire } from "lwc";
import getAvailableAirports from "@salesforce/apex/FlightSearchController.getAvailableAirports";

export default class FlightApiOption extends LightningElement {
  @api flight;
  @api selectedFlight;
  @api carriers;
  @api airports;
  @api firstItem;
  @api lastItem;
  @api type;
  @api passengerCount;
  @api travelClass;
  flightId = 0;
  airportLocations = {};
  allAirports = {};

  @wire(getAvailableAirports)
  wiredAirports({ data }) {
    if (data) {
      this.allAirports = data;
    }
  }

  get selectedClass() {
    let classes = ["container"];
    if (this.flight.id === this.selectedFlight) {
      classes.push("selected");
    }
    if (this.firstItem) {
      classes.push("first");
    }
    if (this.lastItem) {
      classes.push("last");
    }
    return classes.join(" ");
  }

  get optionClass() {
    return this.flightType.oneway ? "option" : "option option-expanded";
  }

  get departureFlight() {
    return this.getFlightDetails(this.flight.itineraries[0]);
  }

  get flightType() {
    return {
      oneway: this.flight.itineraries.length === 1,
      roundtrip: this.flight.itineraries.length === 2,
      multicity: this.flight.itineraries.length > 2,
    };
  }

  get flightOption() {
    const totalPrice = this.flight.price.total;

    return {
      id: this.flight.id,
      validatedCarrier: this.getCarrierName(
        this.flight.validatingAirlineCodes[0],
      ),
      validatedCarrierIATA: this.flight.validatingAirlineCodes[0],
      flights: this.flight.itineraries.map((itinerary) =>
        this.getFlightDetails(itinerary),
      ),
      totalPrice,
      totalPriceFormatted: this.formatCurrency(totalPrice),
      type: this.flightType.oneway
        ? "tussenvlucht"
        : this.flightType.roundtrip
          ? "retourvlucht"
          : "multi city",
      arrivalLocation:
        this.airportLocations[this.arrivalAirport]?.airport ||
        this.arrivalAirport,
      arrivalLocationCity:
        this.airportLocations[this.arrivalAirport]?.city || "",
      departureLocation:
        this.airportLocations[this.departureAirport]?.airport ||
        this.departureAirport,
      departureLocationCity:
        this.airportLocations[this.departureAirport]?.city || "",
      individualFlights: this.getIndividualFlights(),
      upsell: this.type === "alternativeReturn",
      travelerCount: this.passengerCount || 0,
      travelClass: this.travelClass || "",
      holdLuggage: this.checkedBagsIncluded,
      holdLuggageUnits: this.holdLuggageUnits,
      holdLuggageWeight: this.holdLuggageWeight,
      holdLuggagePurchaseAmount: this.holdLuggagePurchaseAmount,
    };
  }

  get departureAirport() {
    return this.flight.itineraries[0].segments[0].departure.iataCode;
  }

  get arrivalAirport() {
    return this.flight.itineraries[0].segments[
      this.flight.itineraries[0].segments.length - 1
    ].arrival.iataCode;
  }

  get fareDetailsBySegment() {
    return this.flight.travelerPricings[0].fareDetailsBySegment || {};
  }

  get checkedBagsIncluded() {
    return this.holdLuggageWeight > 0 || this.holdLuggageUnits > 0;
  }

  get holdLuggagePurchaseAmount() {
    return parseFloat(
      (this.flight.price.additionalServices &&
        this.flight.price.additionalServices.find(
          (service) => service.type === "CHECKED_BAGS",
        )?.amount) ||
        0,
    );
  }

  get holdLuggageUnits() {
    return (
      this.flight.travelerPricings[0].fareDetailsBySegment[0]
        .includedCheckedBags.quantity || 0
    );
  }

  get holdLuggageWeight() {
    return (
      this.flight.travelerPricings[0].fareDetailsBySegment[0]
        .includedCheckedBags.weight || 0
    );
  }

  selectFlight() {
    this.fetchAirportLocations()
      .then(() => {
        this.dispatchEvent(
          new CustomEvent("selectflightoption", {
            detail: this.flightOption,
            bubbles: true,
            composed: true,
          }),
        );
      })
      .catch((error) => {
        console.error("Error fetching airport locations:", error);
      });
  }

  fetchAirportLocations() {
    const airportCodes = [
      this.departureAirport,
      this.arrivalAirport,
      ...this.flight.itineraries.flatMap((itinerary) =>
        itinerary.segments.flatMap((segment) => [
          segment.departure.iataCode,
          segment.arrival.iataCode,
        ]),
      ),
    ];

    const uniqueCodes = [...new Set(airportCodes)];

    const promises = uniqueCodes.map((iataCode) =>
      Promise.resolve().then(() => {
        const name = this.allAirports[iataCode];
        if (name) {
          this.airportLocations[iataCode] = { airport: name, city: "" };
        } else {
          this.airportLocations[iataCode] = { airport: iataCode, city: "" };
        }
      }),
    );

    return Promise.all(promises);
  }

  getCarrierName(code) {
    return this.carriers[code] || code;
  }

  formatCurrency(value) {
    return new Intl.NumberFormat("eu", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  }

  calculateStopDuration(segments) {
    return segments.slice(0, -1).map((segment, index) => {
      const arrivalTime = new Date(segment.arrival.at);
      const departureTime = new Date(segments[index + 1].departure.at);
      const stopDurationMs = departureTime - arrivalTime;
      const stopDurationMin = Math.floor(stopDurationMs / 60000);
      const hours = Math.floor(stopDurationMin / 60);
      const minutes = stopDurationMin % 60;

      return `${hours} hrs ${minutes} min ${segment.arrival.iataCode}`;
    });
  }

  calculateDayDifference(departureTime, arrivalTime) {
    if (typeof departureTime === "string") {
      departureTime = new Date(departureTime);
    }
    if (typeof arrivalTime === "string") {
      arrivalTime = new Date(arrivalTime);
    }
    const durationInMilliseconds = arrivalTime - departureTime;
    return Math.round(durationInMilliseconds / (1000 * 60 * 60 * 24));
  }

  formatTimeWithDateDifference(departureTimeString, arrivalTimeString) {
    const departureTime = new Date(departureTimeString);
    const arrivalTime = new Date(arrivalTimeString);

    const formattedTime = {
      start: `${departureTime.getHours()}:${departureTime.getMinutes().toString().padStart(2, "0")}`,
      end: `${arrivalTime.getHours()}:${arrivalTime.getMinutes().toString().padStart(2, "0")}`,
    };

    const dayDifference = this.calculateDayDifference(
      departureTime,
      arrivalTime,
    );
    const dateDifference = dayDifference > 0 ? ` +${dayDifference}` : "";

    return { formattedTime, dateDifference };
  }

  formatFlightTimes(itinerary) {
    const { formattedTime, dateDifference } = this.formatTimeWithDateDifference(
      itinerary.segments[0].departure.at,
      itinerary.segments[itinerary.segments.length - 1].arrival.at,
    );

    return `${formattedTime.start} - ${formattedTime.end}${dateDifference}`;
  }

  formatDuration(duration) {
    const hours = (duration.match(/(\d+)H/) || [])[1] || 0;
    const minutes = (duration.match(/(\d+)M/) || [])[1] || 0;

    return `${hours} hrs ${minutes} min`;
  }

  getFlightDetails(itinerary) {
    const segmentCount = itinerary.segments.length;
    const stopSum = segmentCount - 1;

    const departureDate = new Date(itinerary.segments[0].departure.at);
    const arrivalDate = new Date(
      itinerary.segments[segmentCount - 1].arrival.at,
    );

    const carrier =
      itinerary.segments[segmentCount - 1].carrierCode ||
      itinerary.segments[segmentCount - 1].operating?.carrierCode;
    const number = itinerary.segments[segmentCount - 1].no;
    const flightNumber = carrier && number ? `${carrier}${number}` : "";

    return {
      flightId: this.flightId++,
      flightTimes: this.formatFlightTimes(itinerary),
      operators: this.getUniqueOperators(itinerary),
      duration: this.formatDuration(itinerary.duration),
      citiesIATA: `${itinerary.segments[0].departure.iataCode} - ${
        itinerary.segments[segmentCount - 1].arrival.iataCode
      }`,
      stopAmount:
        stopSum === 0
          ? "Non-stop"
          : stopSum === 1
            ? "1 stop"
            : `${stopSum} stops`,
      stops: this.calculateStopDuration(itinerary.segments),
      departureFlightDepartureDate: departureDate,
      departureFlightArrivalDate: arrivalDate,
      flightDuration: this.calculateDayDifference(departureDate, arrivalDate),
      flightNumber: flightNumber,
    };
  }

  getUniqueOperators(itinerary) {
    return [
      ...new Set(
        itinerary.segments.map((segment) =>
          this.getCarrierName(
            segment.operating?.carrierCode || segment.carrierCode,
          ),
        ),
      ),
    ].join(", ");
  }

  getFlightClass(segmentId) {
    const fareDetails = this.fareDetailsBySegment.find(
      (segment) => segment.segmentId === segmentId,
    );

    const cabinClassMapping = {
      ECONOMY: "EC",
      PREMIUM_ECONOMY: "ECC",
      BUSINESS: "BC",
      FIRST: "FC",
    };

    return fareDetails ? cabinClassMapping[fareDetails.cabin] || "" : "";
  }

  getIndividualFlights() {
    const individualFlights = [];
    this.flight.itineraries.forEach((itinerary, index) => {
      itinerary.segments.forEach((segment) => {
        let type = this.flightType.oneway
          ? "Tussen"
          : index === this.flight.itineraries.length - 1
            ? "Terug"
            : "Heen";
        individualFlights.push({
          flightNumber: `${segment.operating?.carrierCode || segment.carrierCode}${segment.no}`,
          duration: segment.duration,
          type: type,
          departureAirportCode: segment.departure.iataCode,
          departureAirport:
            this.airportLocations[segment.departure.iataCode]?.airport || "",
          departureAirportCity:
            this.airportLocations[segment.departure.iataCode]?.city || "",
          arrivalAirportCode: segment.arrival.iataCode,
          arrivalAirport:
            this.airportLocations[segment.arrival.iataCode]?.airport || "",
          arrivalAirportCity:
            this.airportLocations[segment.arrival.iataCode]?.city || "",
          departureDateTime: new Date(segment.departure.at),
          arrivalDateTime: new Date(segment.arrival.at),
          carrier: this.getCarrierName(
            segment.operating?.carrierCode || segment.carrierCode,
          ),
          carrierIATA: segment.operating?.carrierCode || segment.carrierCode,
          flightClass: this.getFlightClass(segment.id),
        });
      });
    });
    return individualFlights;
  }
}
