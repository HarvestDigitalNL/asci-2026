import { LightningElement, api } from 'lwc';

export default class FlightApiOptionSelector extends LightningElement {
  @api flightsResult;
  @api selectedFlightId;
  @api flightType;
  @api passengerCount;
  @api travelClass;

  get carriers() {
    return this.flightsResult.dictionaries?.carriers ?? {};
  }

  get flightOptions() {
    return this.flightsResult.data.map((flight, index, array) => {
      return {
        ...flight,
        firstItem: index === 0,
        lastItem: index === array.length - 1
      };
    });
  }
}
