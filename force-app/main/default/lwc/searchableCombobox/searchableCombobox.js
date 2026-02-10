import { LightningElement, api, wire } from "lwc";
import getAvailableAirports from "@salesforce/apex/FlightSearchController.getAvailableAirports";

export default class SearchableCombobox extends LightningElement {
  @api label = "";
  @api value;

  airportName = null;
  searchResults = null;
  selectedSearchResult = null;
  searchTerm = "";
  isComponentFocused = false;
  hasBeenClicked = false;
  allAirports = [];

  @wire(getAvailableAirports)
  wiredAirports({ error, data }) {
    if (data) {
      this.allAirports = Object.entries(data).map(([code, name]) => ({
        label: `${name} (${code})`,
        value: code,
      }));
    }
    if (error) {
      console.error("Error fetching airports:", error);
    }
  }

  get selectedValue() {
    return this.selectedSearchResult?.label || this.fetchedAirportName;
  }

  get fetchedAirportName() {
    if (this.value && !this.airportName) {
      this.getAirportName(this.value);
    }
    return this.airportName;
  }

  getAirportName(iataCode) {
    const match = this.allAirports.find((a) => a.value === iataCode);
    this.airportName = match
      ? match.label.replace(` (${iataCode})`, "")
      : iataCode;
  }

  handleFocusIn() {
    this.isComponentFocused = true;
    if (!this.hasBeenClicked) {
      return;
    }
    if (!this.searchResults && this.allAirports.length > 0) {
      this.searchResults = [...this.allAirports];
    }
  }

  handleFocusOut() {
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    setTimeout(() => {
      if (!this.template.contains(document.activeElement)) {
        this.clearSearchResults();
      }
    }, 200);
  }

  handleClick() {
    this.hasBeenClicked = true;
    if (!this.searchResults && this.allAirports.length > 0) {
      this.searchResults = [...this.allAirports];
    }
  }

  search(event) {
    const input = event.target.value.toLowerCase();
    this.searchTerm = input;

    if (input.length === 0) {
      this.searchResults = [...this.allAirports];
    } else {
      const filtered = this.allAirports.filter(({ label }) =>
        label.toLowerCase().includes(input),
      );
      this.searchResults = filtered.length
        ? filtered
        : [{ label: "Geen resultaten gevonden", value: "no-results" }];
    }
  }

  selectSearchResult(event) {
    const selectedValue = event.currentTarget.dataset.value;
    if (selectedValue === "no-results") return;
    this.selectedSearchResult = this.searchResults.find(
      ({ value }) => value === selectedValue,
    );

    if (this.selectedSearchResult) {
      this.dispatchEvent(
        new CustomEvent("select", { detail: this.selectedSearchResult }),
      );
      this.clearSearchResults();
    }
  }

  clearSearchResults() {
    this.searchResults = null;
  }
}
