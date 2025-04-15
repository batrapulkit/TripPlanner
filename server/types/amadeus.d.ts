declare module 'amadeus' {
  interface AmadeusConstructorOptions {
    clientId: string | undefined;
    clientSecret: string | undefined;
  }

  interface FlightSearchParams {
    originLocationCode: string;
    destinationLocationCode: string;
    departureDate: string;
    adults: number;
    max?: number;
    currencyCode?: string;
  }

  interface AmadeusClient {
    shopping: {
      flightOffersSearch: {
        get(params: FlightSearchParams): Promise<any>;
      };
    };
  }

  class Amadeus {
    constructor(options: AmadeusConstructorOptions);
    shopping: AmadeusClient['shopping'];
  }

  export default Amadeus;
}