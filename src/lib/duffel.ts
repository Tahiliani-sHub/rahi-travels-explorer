import { Duffel } from '@duffel/api';

export type FlightSearchParams = {
  origin: string;
  destination: string;
  departDate: string;
  cabin?: string;
};

export type FlightResult = {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departDate: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  stops: number;
  price: number;
  cabin: string;
  baggage: string;
  refundable: boolean;
  currency: string;
};

export async function searchFlightsWithDuffel(
  duffel: Duffel,
  params: FlightSearchParams
): Promise<FlightResult[]> {
  const { origin, destination, departDate, cabin = 'Any' } = params;

  if (!origin || !destination || !departDate) {
    throw new Error('Missing required parameters: origin, destination, departDate');
  }

  try {
    const offerRequest = await duffel.offerRequests.create({
      slices: [
        {
          origin,
          destination,
          departure_date: departDate
        }
      ],
      passengers: [
        {
          type: 'adult' as const
        }
      ],
      cabin_class: cabin === 'Any' ? undefined : (cabin.toLowerCase() as any)
    });

    const offersResponse = await duffel.offers.list({
      offer_request_id: offerRequest.data.id
    });

    const flights = offersResponse.data?.map((offer: any) => {
      const outboundSlice = offer.slices?.[0];
      const firstSegment = outboundSlice?.segments?.[0];
      const lastSegment = outboundSlice?.segments?.[outboundSlice.segments.length - 1];

      return {
        id: offer.id,
        airline: offer.owner?.name || 'Unknown',
        flightNumber: firstSegment?.flight_number || 'Unknown',
        origin: firstSegment?.origin?.iata_code || '',
        destination: lastSegment?.destination?.iata_code || '',
        departDate: firstSegment?.departing_at?.split('T')[0] || '',
        departTime: firstSegment?.departing_at?.split('T')[1] || '',
        arriveTime: lastSegment?.arriving_at?.split('T')[1] || '',
        duration: outboundSlice?.duration || '',
        stops: (outboundSlice?.segments?.length || 1) - 1,
        price: parseFloat(String(offer.total_amount_in_minor_units / 100 || '0')),
        cabin: cabin === 'Any' ? 'Economy' : cabin,
        baggage: '20kg',
        refundable: false,
        currency: offer.currency || 'USD'
      };
    }) || [];

    return flights;
  } catch (error) {
    console.error('Duffel API error:', error);
    throw new Error('Failed to search flights with Duffel API');
  }
}
