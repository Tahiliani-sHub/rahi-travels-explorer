declare module 'amadeus' {
  export interface AmadeusConfig {
    clientId?: string;
    clientSecret?: string;
  }

  export interface FlightOffersSearchParams {
    originLocationCode: string;
    destinationLocationCode: string;
    departureDate: string;
    adults: string;
    travelClass?: string;
  }

  export interface HotelOffersSearchParams {
    cityCode: string;
    checkInDate: string;
    checkOutDate: string;
    adults: string;
  }

  export interface FlightSegment {
    carrierCode?: string;
    number?: string;
    departure?: {
      iataCode?: string;
      at?: string;
    };
    arrival?: {
      iataCode?: string;
      at?: string;
    };
  }

  export interface FlightItinerary {
    duration?: string;
    segments?: FlightSegment[];
  }

  export interface FlightOffer {
    id: string;
    validatingAirlineCodes?: string[];
    itineraries?: FlightItinerary[];
    price?: {
      total?: string;
      currency?: string;
    };
  }

  export interface HotelAddress {
    cityName?: string;
  }

  export interface HotelMedia {
    uri?: string;
  }

  export interface HotelData {
    hotelId?: string;
    name?: string;
    rating?: string;
    address?: HotelAddress;
    amenities?: string[];
    media?: HotelMedia[];
  }

  export interface HotelPrice {
    total?: string;
    currency?: string;
  }

  export interface HotelOffer {
    price?: HotelPrice;
  }

  export interface Hotel {
    hotel?: HotelData;
    offers?: HotelOffer[];
  }

  export interface FlightSearchResponse {
    data: FlightOffer[];
  }

  export interface HotelSearchResponse {
    data: Hotel[];
  }

  class Amadeus {
    constructor(config: AmadeusConfig);
    shopping: {
      flightOffersSearch: {
        get(params: FlightOffersSearchParams): Promise<FlightSearchResponse>;
      };
      hotelOffers: {
        get(params: HotelOffersSearchParams): Promise<HotelSearchResponse>;
      };
    };
  }

  export default Amadeus;
}
