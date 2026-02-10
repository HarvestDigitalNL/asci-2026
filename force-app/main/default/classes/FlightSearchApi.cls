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

            // Generate 2-3 flights per airline
            Integer numFlights = Math.mod(Math.abs(airlineCode.hashCode()), 2) + 2;

            for (Integer i = 0; i < numFlights && flightCount < 15; i++) {
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
        Integer hourOffset = variant * 4 + Math.mod(Math.abs(airlineCode.hashCode()), 8);
        DateTime departureDateTime = DateTime.newInstance(
            departureDate.year(),
            departureDate.month(),
            departureDate.day(),
            hourOffset,
            Math.mod(variant * 15, 60),
            0
        );
        flight.departureTime = departureDateTime;

        // Calculate duration based on route
        Integer baseDuration = calculateBaseDuration(departureAirport, arrivalAirport);
        Integer durationVariance = Math.mod(variant * 30, 60);
        flight.duration = baseDuration + durationVariance;

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
            variant
        );
        flight.currencyCode = 'USD';

        // Set available seats
        flight.availableSeats = 50 + Math.mod(variant * 20, 150);

        // Determine if direct flight
        flight.isDirect = Math.mod(variant, 3) != 0; // 2 out of 3 flights are direct

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
        Integer variant
    ) {
        // Base price calculation
        Integer routeHash = Math.abs((departure + arrival).hashCode());
        Decimal basePrice = 200 + Math.mod(routeHash, 800);

        // Class multiplier
        Decimal classMultiplier = 1.0;
        if (flightClass == 'Business') {
            classMultiplier = 2.5;
        } else if (flightClass == 'First') {
            classMultiplier = 4.0;
        }

        // Airline multiplier (premium airlines cost more)
        Decimal airlineMultiplier = 1.0;
        if (airlineCode == 'EK' || airlineCode == 'QR' || airlineCode == 'SQ') {
            airlineMultiplier = 1.2;
        } else if (airlineCode == 'BA' || airlineCode == 'LH') {
            airlineMultiplier = 1.1;
        }

        // Variant multiplier (different time slots have different prices)
        Decimal variantMultiplier = 1.0 + (variant * 0.15);

        Decimal finalPrice = basePrice * classMultiplier * airlineMultiplier * variantMultiplier;

        // Round to 2 decimal places
        return finalPrice.setScale(2);
    }

}