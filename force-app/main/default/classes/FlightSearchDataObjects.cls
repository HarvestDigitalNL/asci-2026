public with sharing class FlightSearchDataObjects {
  public class Flight {
    @AuraEnabled public String flightNumber { get; set; }
    @AuraEnabled public String airlineCode { get; set; }
    @AuraEnabled public String airlineName { get; set; }
    @AuraEnabled public String departureAirport { get; set; }
    @AuraEnabled public String arrivalAirport { get; set; }
    @AuraEnabled public Datetime departureTime { get; set; }
    @AuraEnabled public Datetime arrivalTime { get; set; }
    @AuraEnabled public String flightClass { get; set; }
    @AuraEnabled public Decimal price { get; set; }
    @AuraEnabled public String currencyCode { get; set; }
    @AuraEnabled public Integer duration { get; set; } // in minutes
    @AuraEnabled public Integer availableSeats { get; set; }
    @AuraEnabled public Boolean isDirect { get; set; }
  }

  public class SearchCriteria {
    @AuraEnabled public String departureAirport { get; set; }
    @AuraEnabled public String arrivalAirport { get; set; }
    @AuraEnabled public Date departureDate { get; set; }
    @AuraEnabled public Date returnDate { get; set; }
    @AuraEnabled public String flightClass { get; set; } // Economy, Business, First
    @AuraEnabled public List<String> airlineCodes { get; set; }
  }

}