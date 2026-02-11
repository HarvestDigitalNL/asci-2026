public with sharing class FlightSearchController {
  /**
    * Get list of available airports
    * @return Map of airport codes to names
    */
  @AuraEnabled(cacheable=true)
  public static Map<String, String> getAvailableAirports() {
    return FlightSearchApi.airports;
  }

  /**
    * Get list of available airlines
    * @return Map of airline codes to names
    */
  @AuraEnabled(cacheable=true)
  public static Map<String, String> getAvailableAirlines() {
    return FlightSearchApi.airlines;
  }

  /**
    * Method to search flights
    * @param departureAirport IATA code for departure airport
    * @param arrivalAirport IATA code for arrival airport
    * @param departureDate Date of departure
    * @param returnDate Date of return (optional)
    * @param flightClass Class of flight (Economy, Business, First)
    * @param airlineCodes List of string of airline IATA codes
    * @return List of matching flights
    */
  @AuraEnabled
  public static List<FlightSearchDataObjects.Flight> searchFlights(
    String departureAirport,
    String arrivalAirport,
    Date departureDate,
    Date returnDate,
    String flightClass,
    List<String> airlineCodes
  ) {
    // ============================================================
    // EXERCISE 5: Input validation
    // Validate the input parameters before performing the search.
    // - departureAirport and arrivalAirport must not be blank (use String.isBlank())
    // - departureAirport and arrivalAirport must not be the same
    // - departureDate must not be null
    // If validation fails, throw an AuraHandledException with a descriptive message.
    // Example: throw new AuraHandledException('Your message');
    // ============================================================
    // TODO: Add your validation logic here



    // ============================================================
    // EXERCISE 2: Map parameters to SearchCriteria
    // The SearchCriteria object is created below, but its fields are empty.
    // Map each method parameter to the correct field on the criteria object.
    // Hint: Look at FlightSearchDataObjects.cls to see which fields exist.
    // ============================================================
    FlightSearchDataObjects.SearchCriteria criteria = new FlightSearchDataObjects.SearchCriteria();
    return FlightSearchApi.searchFlights(criteria);
  }
}