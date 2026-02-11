# Flight Search Assessment

## Introduction

You are working on a **Salesforce Lightning Web Component (LWC)** for a travel agency. The component allows users to search for flights using a flight search API. The backend (Apex) is mostly in place, and the frontend (LWC) has a partial implementation.

Your job is to complete the missing parts marked with `TODO` comments in the code. Each exercise tells you which file to edit and what to implement.

All exercises are independent — if you get stuck on one, move on to the next.

### Project Structure

| File | Description |
|------|-------------|
| `classes/FlightSearchController.cls` | Apex controller — bridge between the LWC and the API |
| `classes/FlightSearchDataObjects.cls` | Data objects — `Flight` and `SearchCriteria` classes (do not modify) |
| `classes/FlightSearchApi.cls` | Mock flight API — generates flight data (do not modify) |
| `lwc/flightApiData/flightApiData.js` | LWC JavaScript controller |
| `lwc/flightApiData/flightApiData.html` | LWC HTML template |
| `lwc/flightApiData/flightApiData.css` | LWC CSS styles |

> Tip: Start by reading `FlightSearchDataObjects.cls` to understand the data structures used throughout the project.

### Testing your work

To see your changes in action after deploying:

1. Open your Salesforce org (via **SFDX: Open Default Org**).
2. Navigate to the **Opportunities** tab.
3. Click **New** and create an Opportunity with the minimum required fields (Name, Close Date, Stage).
4. Open the Opportunity record and click the **Search Flights** button at the top to open the flight search modal.

Each time you make changes to the code, re-deploy and refresh the page in Salesforce to see the result. You can deploy a single file or component by **right-clicking** it in the VS Code file explorer and selecting **"SFDX: Deploy Source to Org"**.

---

## Overview

| Exercise | Topic | Difficulty |
|----------|-------|------------|
| 1 | LWC JS — Computed property | Easy |
| 2 | Apex — Map parameters to object | Easy |
| 3 | LWC JS — Event handling | Medium |
| 4 | LWC HTML + JS — Airport dropdown | Medium |
| 5 | Apex — Input validation | Medium |
| 6 | LWC HTML — Conditional rendering | Hard |
| Bonus A | LWC JS — Helper method | Bonus |
| Bonus B | Full-stack — Date validation | Bonus |

---

## Exercise 1 — Computed property for search button

**File:** `lwc/flightApiData/flightApiData.js`
**Difficulty:** Easy

The "Zoek vluchten" (Search flights) button has a `disabled={disableSearch}` attribute. The getter `disableSearch` should return `true` when the user cannot search.

**Task:** Implement the getter so it returns `true` when:
- `departureAirport` is empty/falsy, OR
- `arrivalAirport` is empty/falsy, OR
- `departureDate` is empty/falsy, OR
- `isSearching` is `true`, OR
- `resultLimit` is falsy (0, null, undefined)

**Hint:** You can combine conditions with `||` (OR) and negate with `!`.

---

## Exercise 2 — Complete the SearchCriteria mapping

**File:** `classes/FlightSearchController.cls`
**Difficulty:** Easy

The `searchFlights` method receives individual parameters but needs to pass a `SearchCriteria` object to the API. The object is created but its fields are never set.

**Task:** Map each method parameter to the corresponding field on the `criteria` object.

**Hint:** Look at `FlightSearchDataObjects.cls` to see which fields `SearchCriteria` has.

---

## Exercise 3 — Implement the event handler

**File:** `lwc/flightApiData/flightApiData.js`
**Difficulty:** Medium

The `handleChange` method is called by multiple UI elements (date pickers, dropdowns, etc.). Each element has a `data-type` attribute that identifies what changed.

**Task:** Implement the method body. For each `data-type`, update the correct property:

| `data-type` | Value source | Property to update |
|-------------|-------------|-------------------|
| `"date"` | `event.target.value` | `this.departureDate` (wrap in `new Date(...)`) |
| `"returnDate"` | `event.target.value` | `this.returnDate` (wrap in `new Date(...)`) |
| `"limit"` | `event.detail.value` | `this.resultLimit` |
| `"class"` | `event.detail.value` | `this.travelClass` |
| `"airlines"` | `event.detail` | `this.includedAirlineCodes` |
| `"connections"` | `event.detail.value` | `this.maxStops` |
| `"sort"` | `event.detail.value` | `this.sorting` |

**Hint:** Use `event.target.dataset.type` to read the `data-type` attribute. Use `if` statements or a `switch` to handle each case.

> Note: `event.target.value` gives the raw DOM value (used for native inputs like date). `event.detail.value` gives the Salesforce component value (used for lightning-select, etc.).

---

## Exercise 4 — Add airport selection dropdowns

**File:** `lwc/flightApiData/flightApiData.html` + `lwc/flightApiData/flightApiData.js`
**Difficulty:** Medium

The airport selection dropdowns have been removed. You need to add them back using the standard Salesforce `lightning-combobox` component.

### Part A — JavaScript (flightApiData.js)

1. Create a getter called `airportOptions` that transforms `this.airportMap` (which is `{ "AMS": "Amsterdam Airport Schiphol", ... }`) into the format that `lightning-combobox` expects: `[{ label: "Amsterdam Airport Schiphol (AMS)", value: "AMS" }, ...]`

2. Create an event handler called `handleAirportChange` that:
   - Reads `event.target.dataset.type` to determine if it's `"departure"` or `"arrival"`
   - Sets `this.departureAirport` or `this.arrivalAirport` to the selected value (`event.detail.value`)

### Part B — HTML (flightApiData.html)

Add two `lightning-combobox` elements inside the `searchbar-airport` div:
- One for departure airport, one for arrival airport
- Each should use the `airportOptions` getter for its `options`
- Each should use the correct current value (`departureAirport` / `arrivalAirport`)
- Each should call `handleAirportChange` on change
- Use `data-type="departure"` and `data-type="arrival"` to distinguish them

Documentation: https://developer.salesforce.com/docs/platform/lightning-component-reference/guide/lightning-combobox.html?type=Example

---

## Exercise 5 — Add input validation

**File:** `classes/FlightSearchController.cls`
**Difficulty:** Medium

Before performing the search, validate the user input. If validation fails, throw an `AuraHandledException` with a descriptive error message.

**Task:** Add validation for:
- `departureAirport` and `arrivalAirport` must not be blank
- `departureAirport` and `arrivalAirport` must not be the same
- `departureDate` must not be null

**Hint:** Use `String.isBlank()` to check for empty strings. Throw errors like this:
```apex
throw new AuraHandledException('Your error message here');
```

---

## Exercise 6 — Conditional rendering for search results

**File:** `lwc/flightApiData/flightApiData.html`
**Difficulty:** Hard

The search results section is incomplete. You need to implement the conditional rendering logic to show the correct UI state.

**Task:** Inside the `flights-section` div, implement the following states:

1. **Loading state** — When `isSearching` is `true`, show a `lightning-spinner` component (variant="brand", size="medium")
2. **Error state** — When `isSearching` is `false` AND `hasError` is `true`, show the error message from `{error}` in a paragraph with the class `"error"`
3. **Empty state** — When not searching, no error, and `flightsResult` is falsy, show: `"Vul alle velden in om vluchten te zoeken"`
4. **Results state** — When `flightsResult` is truthy, show the `c-flight-api-option-selector` component with these attributes:
   - `flights-result={flightsResult}`
   - `selected-flight-id={selectedFlightId}`
   - `flight-type={flightType}`
   - `travel-class={travelClass}`

**Hint:** Use `template if:true={property}` and `template if:false={property}` or `<div if:true={property}>` for conditional rendering.

Documentation: https://developer.salesforce.com/docs/platform/lwc/guide/create-conditional.html

---

## Bonus A — Duration formatter

**File:** `lwc/flightApiData/flightApiData.js`
**Difficulty:** Bonus

Create a method `formatDuration(minutes)` that converts a number of minutes into a human-readable string.

Examples:
- `formatDuration(90)` → `"1h 30m"`
- `formatDuration(45)` → `"0h 45m"` or `"45m"`
- `formatDuration(120)` → `"2h 00m"` or `"2h"`

**Hint:** Use `Math.floor()` for hours and `%` (modulo) for remaining minutes.

---

## Bonus B — Past date validation with user feedback

**Files:** `classes/FlightSearchController.cls` + `lwc/flightApiData/flightApiData.js`
**Difficulty:** Bonus

Add validation that prevents searching for flights in the past.

**Backend:** In `FlightSearchController.cls`, add a check that `departureDate` is not before `Date.today()`. If it is, throw an `AuraHandledException`.

**Frontend:** In the `searchFlights()` method in `flightApiData.js`, the `.catch()` block already handles errors. But currently the error message parsing might not show the backend message clearly. Improve the error handling so the user sees a clear error when they pick a past date.

Hint (Apex):
```apex
if (departureDate < Date.today()) {
    throw new AuraHandledException('Departure date cannot be in the past');
}
```

---

Good luck!
