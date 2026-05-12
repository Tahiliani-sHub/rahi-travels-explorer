declare module '@duffel/api' {
  export interface DuffelConfig {
    token: string;
  }

  export interface Location {
    iataCode: string;
    cityName?: string;
    name?: string;
  }

  export interface TimeRange {
    departure: string;
    arrival: string;
  }

  export interface Segment {
    id: string;
    departing_at: string;
    arriving_at: string;
    origin: Location;
    destination: Location;
    operating_carrier: {
      iataCode: string;
      name: string;
    };
    aircraft: {
      iataCode: string;
      name: string;
    };
    flight_number: string;
  }

  export interface Slice {
    id: string;
    duration: string;
    segments: Segment[];
    origin: Location;
    destination: Location;
  }

  export interface Fare {
    type: string;
    total_amount_in_minor_units: number;
    total_amount: string;
    currency: string;
    base_amount: string;
    tax_amount?: string;
  }

  export interface Offer {
    id: string;
    slices: Slice[];
    owner: {
      name: string;
      iataCode: string;
    };
    base_price: string;
    tax_amount?: string;
    total_amount: string;
    currency: string;
  }

  export interface FlightSearchParams {
    data: {
      type: string;
      outbound_departure_date: string;
      outbound_departure_time?: string;
      inbound_departure_date?: string;
      inbound_departure_time?: string;
      passengers: Array<{
        type: string;
        given_name?: string;
        family_name?: string;
        born_at?: string;
      }>;
      cabin_class?: string;
      max_stops?: number;
    };
    location_schema: string;
  }

  export interface SearchResponse {
    data: Array<{
      id: string;
      slices: Slice[];
      owner: {
        name: string;
        iataCode: string;
      };
      base_price: string;
      tax_amount?: string;
      total_amount: string;
      currency: string;
    }>;
  }

  class Duffel {
    constructor(config: DuffelConfig);
    offers: {
      list(): Promise<SearchResponse>;
      create(params: FlightSearchParams): Promise<SearchResponse>;
      get(id: string): Promise<any>;
    };
  }

  export default Duffel;
}
