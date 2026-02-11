public with sharing class FlightSearchApi {
  // Mock airline data
  public static Map<String, String> airlines = new Map<String, String>{
    'AA' => 'American Airlines',
    'DL' => 'Delta Air Lines',
    'UA' => 'United Airlines',
    'BA' => 'British Airways',
    'LH' => 'Lufthansa',
    'AF' => 'Air France',
    'KL' => 'KLM Royal Dutch Airlines',
    'EK' => 'Emirates',
    'QR' => 'Qatar Airways',
    'SQ' => 'Singapore Airlines'
  };

  // Mock airport data
  public static Map<String, String> airports = new Map<String, String>{
    'JFK' => 'John F. Kennedy International Airport',
    'LAX' => 'Los Angeles International Airport',
    'LHR' => 'London Heathrow Airport',
    'CDG' => 'Charles de Gaulle Airport',
    'FRA' => 'Frankfurt Airport',
    'AMS' => 'Amsterdam Airport Schiphol',
    'DXB' => 'Dubai International Airport',
    'SIN' => 'Singapore Changi Airport',
    'ORD' => 'O\'Hare International Airport',
    'ATL' => 'Hartsfield-Jackson Atlanta International Airport'
  };

  /**
   * Search for flights based on criteria
   * @param criteria SearchCriteria object with search parameters
   * @return List of matching flights
   */
  @AuraEnabled(cacheable=true)
  public static List<FlightSearchDataObjects.Flight> searchFlights(FlightSearchDataObjects.SearchCriteria criteria) {
    List<FlightSearchDataObjects.Flight> flights = new List<FlightSearchDataObjects.Flight>();

        // Validate required fields
        if (String.isBlank(criteria.departureAirport) ||
            String.isBlank(criteria.arrivalAirport) ||
            criteria.departureDate == null) {
            return flights;
        }

    // Generate mock flights
    flights = generateMockFlights(criteria);

    return flights;
  }


  /**
   * Generate mock flight data based on search criteria
   */
  private static List<FlightSearchDataObjects.Flight> generateMockFlights(FlightSearchDataObjects.SearchCriteria criteria) {
    List<FlightSearchDataObjects.Flight> flights = new List<FlightSearchDataObjects.Flight>();

    // Determine which airlines to use
    List<String> airlinesToUse = new List<String>();
    if (criteria.airlineCodes != null && !criteria.airlineCodes.isEmpty()) {
      airlinesToUse = criteria.airlineCodes;
    } else {
      airlinesToUse = new List<String>(airlines.keySet());
    }

    // Generate flights for each airline
    Integer flightCount = 0;
    for (String airlineCode : airlinesToUse) {
      if (!airlines.containsKey(airlineCode)) {
        continue;
      }

      // Generate 3 flights per airline (one for each stop variant: 0, 1, 2)
      Integer numFlights = 3;

      for (Integer i = 0; i < numFlights && flightCount < 20; i++) {
        FlightSearchDataObjects.Flight flight = generateFlight(
                airlineCode,
                criteria.departureAirport,
                criteria.arrivalAirport,
                criteria.departureDate,
                criteria.flightClass,
                i
        );
        flights.add(flight);
        flightCount++;
      }
    }

    return flights;
  }

  /**
   * Generate a single mock flight
   */
  private static FlightSearchDataObjects.Flight generateFlight(
          String airlineCode,
          String departureAirport,
          String arrivalAirport,
          Date departureDate,
          String flightClass,
          Integer variant
  ) {
    FlightSearchDataObjects.Flight flight = new FlightSearchDataObjects.Flight();

    flight.airlineCode = airlineCode;
    flight.airlineName = airlines.get(airlineCode);
    flight.departureAirport = departureAirport;
    flight.arrivalAirport = arrivalAirport;

    // Generate flight number
    Integer flightNum = 1000 + Math.mod(Math.abs((airlineCode + departureAirport + arrivalAirport).hashCode()), 8999) + variant;
    flight.flightNumber = airlineCode + String.valueOf(flightNum);

    // Set departure time (spread throughout the day)
    Integer hourOffset = variant * 3 + Math.mod(Math.abs(airlineCode.hashCode()), 6);
    DateTime departureDateTime = DateTime.newInstance(
            departureDate.year(),
            departureDate.month(),
            departureDate.day(),
            6 + hourOffset, // Start from 6 AM
            Math.mod(variant * 17 + Math.abs(airlineCode.hashCode()), 60),
            0
    );
    flight.departureTime = departureDateTime;

    // Determine stops (0, 1, or 2) - use simple pattern based on variant
    // This ensures we get a good mix of 0, 1, and 2 stops
    if (variant == 0) {
      flight.stops = 0; // First flight per airline is always direct
    } else if (variant == 1) {
      flight.stops = 1; // Second flight has 1 stop
    } else {
      flight.stops = 2; // Third flight has 2 stops
    }
    flight.isDirect = (flight.stops == 0);

    // Calculate duration based on route - MORE VARIED
    Integer baseDuration = calculateBaseDuration(departureAirport, arrivalAirport);
    // Add significant variance: variant * 45 mins, plus airline-specific variance
    Integer durationVariance = (variant * 45) + Math.mod(Math.abs(airlineCode.hashCode()), 90);
    // Add extra time for stops (30-60 mins per stop for layover)
    Integer stopTime = flight.stops * (30 + Math.mod(Math.abs(airlineCode.hashCode()), 30));
    flight.duration = baseDuration + durationVariance + stopTime;

    // Set arrival time
    flight.arrivalTime = departureDateTime.addMinutes(flight.duration);

    // Set flight class
    flight.flightClass = String.isNotBlank(flightClass) ? flightClass : 'Economy';

    // Calculate price based on various factors
    flight.price = calculatePrice(
      departureAirport,
      arrivalAirport,
      flight.flightClass,
      airlineCode,
      variant,
      flight.stops
    );
    flight.currencyCode = 'EUR';

    // Set available seats - varies more by class
    Integer baseSeats = 50;
    if (flight.flightClass == 'Business') {
      baseSeats = 20;
    } else if (flight.flightClass == 'First') {
      baseSeats = 8;
    }
    flight.availableSeats = baseSeats + Math.mod(variant * 7, 20);

    return flight;
  }

  /**
   * Calculate base flight duration based on route
   */
  private static Integer calculateBaseDuration(String departure, String arrival) {
    // Simple hash-based calculation for consistent but varied durations
    Integer hash = Math.abs((departure + arrival).hashCode());
    Integer baseDuration = 60 + Math.mod(hash, 600); // 1-11 hours

    // Adjust for common routes
    if ((departure == 'JFK' && arrival == 'LAX') || (departure == 'LAX' && arrival == 'JFK')) {
      return 360; // ~6 hours
    } else if ((departure == 'JFK' && arrival == 'LHR') || (departure == 'LHR' && arrival == 'JFK')) {
      return 450; // ~7.5 hours
    } else if ((departure == 'LHR' && arrival == 'DXB') || (departure == 'DXB' && arrival == 'LHR')) {
      return 420; // ~7 hours
    }

    return baseDuration;
  }

  /**
   * Calculate price based on various factors
   */
  private static Decimal calculatePrice(
          String departure,
          String arrival,
          String flightClass,
          String airlineCode,
          Integer variant,
          Integer stops
  ) {
    // Base price calculation
    Integer routeHash = Math.abs((departure + arrival).hashCode());
    Decimal basePrice = 150 + Math.mod(routeHash, 400);

    // Class multiplier - VERY VISIBLE DIFFERENCE
    Decimal classMultiplier = 1.0;
    if (flightClass == 'Business') {
      classMultiplier = 3.0; // Business is 3x economy
    } else if (flightClass == 'First') {
      classMultiplier = 5.0; // First is 5x economy
    }

    // Stops discount (flights with stops are cheaper)
    Decimal stopsMultiplier = 1.0;
    if (stops == 1) {
      stopsMultiplier = 0.75; // 25% cheaper with 1 stop
    } else if (stops >= 2) {
      stopsMultiplier = 0.60; // 40% cheaper with 2+ stops
    }

    // Airline multiplier (premium airlines cost more)
    Decimal airlineMultiplier = 1.0;
    if (airlineCode == 'EK' || airlineCode == 'QR' || airlineCode == 'SQ') {
      airlineMultiplier = 1.3; // Premium Asian/Middle East carriers
    } else if (airlineCode == 'BA' || airlineCode == 'LH' || airlineCode == 'AF') {
      airlineMultiplier = 1.15; // European flag carriers
    } else if (airlineCode == 'KL') {
      airlineMultiplier = 1.1; // KLM
    }

    // Variant multiplier (different time slots have different prices)
    Decimal variantMultiplier = 1.0 + (variant * 0.1);

    Decimal finalPrice = basePrice * classMultiplier * stopsMultiplier * airlineMultiplier * variantMultiplier;

    // Round to 2 decimal places
    return finalPrice.setScale(2);
  }

}