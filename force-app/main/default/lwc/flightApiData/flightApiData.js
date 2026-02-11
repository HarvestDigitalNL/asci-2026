import { LightningElement, api, wire } from "lwc";
import getAvailableAirlines from "@salesforce/apex/FlightSearchController.getAvailableAirlines";
import getAvailableAirports from "@salesforce/apex/FlightSearchController.getAvailableAirports";
import searchFlights from "@salesforce/apex/FlightSearchController.searchFlights";

const flightClasses = [
  {
    label: "--- Selecteer klasse ---",
    value: "",
    disabled: true,
  },
  {
    label: "Economy",
    value: "Economy",
  },
  {
    label: "Business",
    value: "Business",
  },
  {
    label: "First",
    value: "First",
  },
];

const maxNumberOfConnections = [
  { label: "Default", value: "10" },
  { label: "0", value: "0" },
  { label: "1", value: "1" },
  { label: "2", value: "2" },
];

const sortOptions = [
  { label: "Kortste ", value: "time" },
  { label: "Goedkoopste", value: "price" },
];

export default class FlightApiData extends LightningElement {
  @api itineraryId;
  @api selectedFlightId;
  @api flightType;
  @api flightsResult;
  @api storedPassengerData;

  isSearching = false;
  hasError = false;
  error;
  preferredAirlines = [];
  airportMap = {};

  flightClasses = flightClasses;
  maxNumberOfConnections = maxNumberOfConnections;
  sortOptions = sortOptions;

  get getFlightType() {
    return {
      return: this.flightType === "return",
    };
  }

  _departureDate;
  get departureDate() {
    if (this._departureDate) {
      return this.formatDate(this._departureDate, { backend: true });
    }
    if (this.storedPassengerData?.originDestinations?.[0]?.flightDate) {
      return this.storedPassengerData.originDestinations[0].flightDate;
    }
    const today = new Date();
    today.setDate(today.getDate() + 7);
    return this.formatDate(today, { backend: true });
  }

  set departureDate(value) {
    this._departureDate = value instanceof Date ? value : new Date(value);
  }

  _returnDate;
  get returnDate() {
    if (this._returnDate) {
      return this.formatDate(this._returnDate, { backend: true });
    }
    if (this.storedPassengerData?.originDestinations?.[1]?.flightDate) {
      return this.storedPassengerData.originDestinations[1].flightDate;
    }
    const dep = new Date(this.departureDate);
    dep.setDate(dep.getDate() + 7);
    return this.formatDate(dep, { backend: true });
  }

  set returnDate(value) {
    this._returnDate = value instanceof Date ? value : new Date(value);
  }

  get formattedDates() {
    return {
      departure: this.formatDate(new Date(this.departureDate)),
      arrival: this.formatDate(new Date(this.returnDate)),
    };
  }

  _departureAirport;
  get departureAirport() {
    return (
      this._departureAirport ||
      this.storedPassengerData?.originDestinations?.[0]?.originLocationCode ||
      ""
    );
  }

  set departureAirport(value) {
    this._departureAirport = value;
  }

  _arrivalAirport;
  get arrivalAirport() {
    return (
      this._arrivalAirport ||
      this.storedPassengerData?.originDestinations?.[0]
        ?.destinationLocationCode ||
      ""
    );
  }

  set arrivalAirport(value) {
    this._arrivalAirport = value;
  }

  _resultLimit = 10;
  get resultLimit() {
    return this._resultLimit;
  }

  set resultLimit(value) {
    this._resultLimit = value;
  }

  _travelClass;
  get travelClass() {
    return (
      this._travelClass || this.storedPassengerData?.travelClass || "Economy"
    );
  }

  set travelClass(value) {
    this._travelClass = value;
  }

  _includedAirlineCodes;
  get includedAirlineCodes() {
    return this._includedAirlineCodes !== undefined
      ? this._includedAirlineCodes
      : this.storedPassengerData?.includedAirlineCodes || "";
  }

  set includedAirlineCodes(value) {
    if (Array.isArray(value)) {
      this._includedAirlineCodes = value.join(",");
    } else {
      this._includedAirlineCodes = value || "";
    }
  }

  _maxStops;
  get maxStops() {
    return this._maxStops || this.storedPassengerData?.maxStops || "10";
  }

  set maxStops(value) {
    this._maxStops = value;
  }

  _sorting;
  get sorting() {
    return this._sorting || this.storedPassengerData?.sorting || "price";
  }

  set sorting(value) {
    this._sorting = value;
  }



  // ============================================================
  // EXERCISE 1: Computed property for search button
  // Return true when the search button should be DISABLED.
  // Disable when:
  //   - departureAirport is empty/falsy, OR
  //   - arrivalAirport is empty/falsy, OR
  //   - departureDate is empty/falsy, OR
  //   - isSearching is true, OR
  //   - resultLimit is falsy (0, null, undefined)
  //
  // Hint: use || (OR) to combine conditions, ! to negate
  // ============================================================
  get disableSearch() {
    // TODO: Implement this getter
    return true; // placeholder — always disabled until you fix this
  }

  get passengers() {
    return {
      adults: 1,
      children: 0,
      infants: 0,
      travelerCount: 1,
    };
  }



  get originDestinations() {
    const destinations = [
      {
        id: 1,
        originLocationCode: this.departureAirport,
        destinationLocationCode: this.arrivalAirport,
        flightDate: this.departureDate,
      },
    ];

    if (this.getFlightType.return && this.returnDate) {
      destinations.push({
        id: 2,
        originLocationCode: this.arrivalAirport,
        destinationLocationCode: this.departureAirport,
        flightDate: this.returnDate,
      });
    }

    return destinations;
  }

  get passengerData() {
    return {
      originDestinations: this.originDestinations,
      initialDepartureDate: this.departureDate,
      ...this.passengers,
      resultLimit: this.resultLimit,
      travelClass: this.travelClass,
      ...(this.includedAirlineCodes && {
        includedAirlineCodes: this.includedAirlineCodes,
      }),
      maxStops: this.maxStops ? this.maxStops : null,
      sorting: this.sorting,
    };
  }

  @wire(getAvailableAirlines)
  wiredAirlines({ error, data }) {
    if (error) {
      console.error("Error fetching airlines:", error);
      return;
    }
    if (data) {
      this.preferredAirlines = Object.entries(data).map(([code, name]) => ({
        label: name,
        value: code,
      }));
    }
  }

  @wire(getAvailableAirports)
  wiredAirports({ error, data }) {
    if (error) {
      console.error("Error fetching airports:", error);
      return;
    }
    if (data) {
      this.airportMap = data;
    }
  }

  adjustDays(event) {
    const type = event.target.dataset.type;
    const dep = new Date(this.departureDate);

    if (type === "decrease") {
      dep.setDate(dep.getDate() - 1);
    }
    if (type === "increase") {
      dep.setDate(dep.getDate() + 1);
    }

    this.departureDate = dep;
  }

  adjustSearchLimit(event) {
    if (this.isSearching) return;
    const type = event.target.dataset.type;

    if (type === "decrease" && this.resultLimit > 1) {
      this.resultLimit--;
    }
    if (type === "increase") {
      this.resultLimit++;
    }
  }

  // ============================================================
  // EXERCISE 3: Event handling
  //
  // This method is called by multiple UI elements. Each element has
  // a data-type attribute. Read it with: event.target.dataset.type
  //
  // For each type, update the correct property:
  //
  //   "date"        → this.departureDate = new Date(event.target.value)
  //   "returnDate"  → this.returnDate    = new Date(event.target.value)
  //   "limit"       → this.resultLimit   = event.detail.value
  //   "class"       → this.travelClass   = event.detail.value
  //   "airlines"    → this.includedAirlineCodes = event.detail
  //   "connections" → this.maxStops      = event.detail.value
  //   "sort"        → this.sorting       = event.detail.value
  //
  // Note: date inputs use event.target.value (raw DOM).
  //       Salesforce components use event.detail.value.
  //       The airlines multi-select uses event.detail (no .value).
  // ============================================================
  handleChange(event) {
    // TODO: Implement this method
  }

  // ============================================================
  // BONUS A: Duration formatter
  //
  // Create a method formatDuration(minutes) that converts a number
  // of minutes into a readable string.
  //
  // Examples:
  //   formatDuration(90)  → "1h 30m"
  //   formatDuration(45)  → "0h 45m"
  //   formatDuration(120) → "2h 00m"
  //
  // Hint: Math.floor() for hours, % (modulo) for remaining minutes
  // ============================================================
  // TODO: Add your formatDuration method here (optional)


  formatDate(date, options = { backend: false }) {
    if (!(date instanceof Date) || isNaN(date)) return "";
    if (options.backend) {
      const year = date.getFullYear();
      const month = ("0" + (date.getMonth() + 1)).slice(-2);
      const day = ("0" + date.getDate()).slice(-2);
      return `${year}-${month}-${day}`;
    }
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }

  // ============================================================
  // EXERCISE 4 - Part A: Airport selection dropdowns
  //
  // Step 1: Create a GETTER called "airportOptions" that transforms
  //   this.airportMap (e.g. { "AMS": "Amsterdam Airport Schiphol", ... })
  //   into the format lightning-combobox expects:
  //   [ { label: "Amsterdam Airport Schiphol (AMS)", value: "AMS" }, ... ]
  //
  //   Hint: Use Object.entries(this.airportMap) to get [key, value] pairs,
  //   then .map() to transform each pair.
  //
  // Step 2: Create an EVENT HANDLER called "handleAirportChange" that:
  //   - Reads event.target.dataset.type ("departure" or "arrival")
  //   - Sets this.departureAirport or this.arrivalAirport to event.detail.value
  //
  // Docs: https://developer.salesforce.com/docs/platform/lightning-component-reference/guide/lightning-combobox.html?type=Example
  // ============================================================
  // TODO: Add your airportOptions getter here


  // TODO: Add your handleAirportChange event handler here


  dispatchPassengerData() {
    this.dispatchEvent(
      new CustomEvent("passengerdata", {
        detail: this.passengerData,
      }),
    );
  }

  resetFlights() {
    // eslint-disable-next-line @lwc/lwc/no-api-reassignments
    this.flightsResult = undefined;
    this.dispatchEvent(new CustomEvent("reset"));
  }

  /**
   * Convert flat Flight objects from FlightSearchController into
   * the Amadeus-like structure that flightApiOptionSelector/flightApiOption expect.
   */
  convertToAmadeusFormat(flights) {
    const carriers = {};
    let idCounter = 1;

    const data = flights.map((flight) => {
      carriers[flight.airlineCode] = flight.airlineName;

      const depTime = flight.departureTime;
      const arrTime = flight.arrivalTime;

      const segment = {
        id: String(idCounter),
        departure: {
          iataCode: flight.departureAirport,
          at: depTime,
        },
        arrival: {
          iataCode: flight.arrivalAirport,
          at: arrTime,
        },
        carrierCode: flight.airlineCode,
        operating: { carrierCode: flight.airlineCode },
        no: flight.flightNumber.replace(flight.airlineCode, ""),
        duration: `PT${Math.floor(flight.duration / 60)}H${flight.duration % 60}M`,
      };

      const itinerary = {
        duration: segment.duration,
        segments: [segment],
      };

      const result = {
        id: String(idCounter),
        itineraries: [itinerary],
        price: {
          total: String(flight.price),
          currency: flight.currencyCode,
        },
        validatingAirlineCodes: [flight.airlineCode],
        travelerPricings: [
          {
            fareDetailsBySegment: [
              {
                segmentId: String(idCounter),
                cabin: flight.flightClass
                  ? flight.flightClass.toUpperCase()
                  : "ECONOMY",
                includedCheckedBags: { quantity: 1, weight: 23 },
              },
            ],
          },
        ],
      };

      idCounter++;
      return result;
    });

    return {
      data: data,
      dictionaries: {
        carriers: carriers,
        aircraft: {},
        currencies: {},
        locations: {},
      },
    };
  }

  searchFlights() {
    this.isSearching = true;
    this.hasError = false;

    this.resetFlights();
    this.dispatchPassengerData();
    this.dispatchEvent(
      new CustomEvent("searchflights", { bubbles: true, composed: true }),
    );

    // Build airline codes list from selected items
    const airlineCodes = this.includedAirlineCodes
      ? this.includedAirlineCodes.split(",").map((c) => c.trim()).filter((c) => c)
      : [];

    searchFlights({
      departureAirport: this.departureAirport,
      arrivalAirport: this.arrivalAirport,
      departureDate: this.departureDate,
      returnDate: this.getFlightType.return ? this.returnDate : null,
      flightClass: this.travelClass,
      airlineCodes: airlineCodes,
    })
      .then((flights) => {
        // Apply result limit
        let limitedFlights = flights;
        if (this.resultLimit && flights.length > this.resultLimit) {
          limitedFlights = flights.slice(0, this.resultLimit);
        }

        // Apply max stops filter
        if (this.maxStops !== "10") {
          const maxStopsInt = parseInt(this.maxStops, 10);
          limitedFlights = limitedFlights.filter((f) => (f.stops || 0) <= maxStopsInt);
        }

        // Sort
        if (this.sorting === "time") {
          limitedFlights.sort((a, b) => a.duration - b.duration);
        } else {
          limitedFlights.sort((a, b) => a.price - b.price);
        }

        // Convert to Amadeus format for downstream components
        const result = this.convertToAmadeusFormat(limitedFlights);

        // eslint-disable-next-line @lwc/lwc/no-api-reassignments
        this.flightsResult = result;

        if (this.flightsResult.data.length === 0) {
          this.hasError = true;
          this.error = "Geen vluchten gevonden";
        }

        this.dispatchEvent(
          new CustomEvent("setflightsresult", { detail: this.flightsResult }),
        );
        this.isSearching = false;
      })
      .catch((error) => {
        console.error("Error fetching flight offers:", error);
        this.isSearching = false;
        this.hasError = true;
        this.error =
          error.body?.message ||
          error.message ||
          "Er is een fout opgetreden bij het zoeken";
      });
  }
}
