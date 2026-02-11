public with sharing class FlightSearchDataSeeder {
  public static void createAirports(){
    Map<String, String> airports = FlightSearchApi.airports;
    List<Airport__c> airportRecords = new List<Airport__c>();
    for(String code : airports.keySet()){
      airportRecords.add(new Airport__c( IATA__c = code, DisplayName__c = airports.get(code)));
    }
    insert airportRecords;
  }

  public static void createAirlines(){
    Map<String, String> airlines = FlightSearchApi.airlines;
    List<Airline__c> airlineRecords = new List<Airline__c>();
    for(String code : airlines.keySet()){
      airlineRecords.add(new Airline__c( IATA__c = code, DisplayName__c = airlines.get(code)));
    }
    insert airlineRecords;
  }

  public static void createOpportunity(){
    Opportunity opp = new Opportunity(
            Name = 'Test Flight Booking',
            StageName = 'Prospecting',
            CloseDate = Date.today().addDays(30),
            TravelStartDate__c = Date.today().addDays(10),
            TravelEndDate__c = Date.today().addDays(22),
            AmountOfTravellers__c = Math.floor(Math.random() * 5) + 1

    );
    insert opp;
  }

  public static void seedData(){
    createAirports();
    createAirlines();
    createOpportunity();
  }
}