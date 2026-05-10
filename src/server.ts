import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { searchFlights } from "./data/flights";
import { searchHotels } from "./data/hotels";
import { searchTrains } from "./data/trains";
import { searchHolidays } from "./data/holidays";
import { packages } from "./data/packages";
import Amadeus from 'amadeus';

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function jsonResponse(payload: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
    ...init,
  });
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

async function forwardToAmedeus(request: Request, baseUrl: string) {
  const url = new URL(request.url);
  const target = new URL(url.pathname + url.search, baseUrl).toString();
  return fetch(target, {
    method: request.method,
    headers: request.headers,
    body: request.method === "GET" ? null : request.body,
  });
}

async function handleApiRequest(request: Request, env: unknown) {
  const url = new URL(request.url);
  const envAny = env as Record<string, string | undefined>;
  const amadeus = new Amadeus({
    clientId: envAny.AMADEUS_CLIENT_ID || "",
    clientSecret: envAny.AMADEUS_CLIENT_SECRET || ""
  });

  if (url.pathname === "/api/search/flights") {
    const origin = url.searchParams.get("origin") ?? "";
    const destination = url.searchParams.get("destination") ?? "";
    const departDate = url.searchParams.get("departDate") ?? "";
    const cabin = url.searchParams.get("cabin") ?? "Any";

    if (amadeus && envAny.AMADEUS_CLIENT_ID) {
      try {
        const response = await amadeus.shopping.flightOffersSearch.get({
          originLocationCode: origin,
          destinationLocationCode: destination,
          departureDate: departDate,
          adults: '1',
          travelClass: cabin === 'Any' ? undefined : cabin.toUpperCase()
        });

        const flights = response.data.map((flight: any) => ({
          id: flight.id,
          airline: flight.validatingAirlineCodes?.[0] || 'Unknown',
          flightNumber: flight.itineraries?.[0]?.segments?.[0]?.carrierCode + flight.itineraries?.[0]?.segments?.[0]?.number || 'Unknown',
          origin: flight.itineraries?.[0]?.segments?.[0]?.departure?.iataCode || '',
          destination: flight.itineraries?.[0]?.segments?.[flight.itineraries[0].segments.length - 1]?.arrival?.iataCode || '',
          departDate: flight.itineraries?.[0]?.segments?.[0]?.departure?.at?.split('T')[0] || '',
          departTime: flight.itineraries?.[0]?.segments?.[0]?.departure?.at?.split('T')[1] || '',
          arriveTime: flight.itineraries?.[0]?.segments?.[flight.itineraries[0].segments.length - 1]?.arrival?.at?.split('T')[1] || '',
          duration: flight.itineraries?.[0]?.duration || '',
          stops: (flight.itineraries?.[0]?.segments?.length || 1) - 1,
          price: parseFloat(flight.price?.total || '0'),
          cabin: cabin === 'Any' ? 'Economy' : cabin,
          baggage: '20kg',
          refundable: false,
          currency: flight.price?.currency || 'USD'
        }));

        return jsonResponse(flights);
      } catch (error) {
        console.error('Amadeus flight search error:', error);
      }
    }

    return jsonResponse(searchFlights({ origin, destination, departDate, cabin }));
  }

  if (url.pathname === "/api/search/hotels") {
    const city = url.searchParams.get("city") ?? "";
    const checkIn = url.searchParams.get("checkIn") ?? "";
    const checkOut = url.searchParams.get("checkOut") ?? "";
    const guests = Number(url.searchParams.get("guests") ?? "2");

    const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));

    if (amadeus && envAny.AMADEUS_CLIENT_ID) {
      try {
        const response = await amadeus.shopping.hotelOffers.get({
          cityCode: city,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          adults: guests.toString()
        });

        const hotels = response.data.map((hotel: any) => ({
          id: hotel.hotel?.hotelId || 'Unknown',
          name: hotel.hotel?.name || 'Unknown Hotel',
          city: hotel.hotel?.address?.cityName || city,
          location: hotel.hotel?.address?.cityName || city,
          rating: parseFloat(hotel.hotel?.rating || '0'),
          stars: Math.floor(parseFloat(hotel.hotel?.rating || '0')),
          price: parseFloat(hotel.offers?.[0]?.price?.total || '0') / nights,
          reviewCount: 0,
          image: hotel.hotel?.media?.[0]?.uri || '',
          roomsAvailable: 10,
          amenities: hotel.hotel?.amenities || [],
          refundable: false,
          promotion: false,
          childFriendly: false,
          boardType: 'Room Only',
          currency: hotel.offers?.[0]?.price?.currency || 'USD'
        }));

        return jsonResponse(hotels);
      } catch (error) {
        console.error('Amadeus hotel search error:', error);
      }
    }

    return jsonResponse(searchHotels({ city, guests, filters: { recommended: false, promotion: false, childFriendly: false, availableOnly: false, refundable: false }, rating: null }));
  }

  if (url.pathname === "/api/search/trains") {
    const origin = url.searchParams.get("origin") ?? "";
    const destination = url.searchParams.get("destination") ?? "";
    const departDate = url.searchParams.get("departDate") ?? "";
    const seatClass = url.searchParams.get("seatClass") ?? "Any";
    return jsonResponse(searchTrains({ origin, destination, departDate, seatClass }));
  }

  if (url.pathname === "/api/search/holidays") {
    const destination = url.searchParams.get("destination") ?? "";
    const date = url.searchParams.get("date") ?? "";
    const guests = Number(url.searchParams.get("guests") ?? "2");
    return jsonResponse(searchHolidays({ destination, date, guests }));
  }

  if (url.pathname === "/api/packages") {
    return jsonResponse(packages);
  }

  return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { "content-type": "application/json; charset=utf-8" } });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (url.pathname.startsWith("/api/")) {
        return await handleApiRequest(request, env);
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
