export type Flight = {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  stops: number;
  price: number;
  cabin: "Economy" | "Premium Economy" | "Business" | "First";
  baggage: string;
  refundable: boolean;
};

const flights: Flight[] = [
  {
    id: "rht-1001",
    airline: "Tunisair",
    flightNumber: "TU 702",
    origin: "TUN",
    destination: "DJE",
    departDate: "2026-06-08",
    departTime: "09:50",
    arriveTime: "11:30",
    duration: "1h 40m",
    stops: 0,
    price: 199,
    cabin: "Economy",
    baggage: "20kg",
    refundable: false,
  },
  {
    id: "rht-1002",
    airline: "Aegean Airlines",
    flightNumber: "A3 1330",
    origin: "TUN",
    destination: "PAR",
    departDate: "2026-06-08",
    departTime: "14:10",
    arriveTime: "17:20",
    duration: "3h 10m",
    stops: 0,
    price: 349,
    cabin: "Premium Economy",
    baggage: "25kg",
    refundable: false,
  },
  {
    id: "rht-1003",
    airline: "Emirates",
    flightNumber: "EK 775",
    origin: "TUN",
    destination: "DXB",
    departDate: "2026-06-08",
    departTime: "23:15",
    arriveTime: "07:05",
    duration: "6h 50m",
    stops: 0,
    price: 659,
    cabin: "Business",
    baggage: "2x32kg",
    refundable: true,
  },
  {
    id: "rht-1004",
    airline: "Air France",
    flightNumber: "AF 812",
    origin: "TUN",
    destination: "CDG",
    departDate: "2026-06-09",
    departTime: "06:20",
    arriveTime: "09:50",
    duration: "3h 30m",
    stops: 0,
    price: 389,
    cabin: "Economy",
    baggage: "23kg",
    refundable: false,
  },
  {
    id: "rht-1005",
    airline: "Qatar Airways",
    flightNumber: "QR 139",
    origin: "TUN",
    destination: "DOH",
    departDate: "2026-06-10",
    departTime: "10:45",
    arriveTime: "15:20",
    duration: "4h 35m",
    stops: 0,
    price: 429,
    cabin: "Economy",
    baggage: "25kg",
    refundable: false,
  },
];

export const searchFlights = ({
  origin,
  destination,
  departDate,
  cabin,
}: {
  origin: string;
  destination: string;
  departDate: string;
  cabin: string;
}) => {
  const queryOrigin = origin.trim().toUpperCase();
  const queryDestination = destination.trim().toUpperCase();
  const queryDate = departDate.trim();

  return flights.filter((flight) => {
    const matchesOrigin = !queryOrigin || flight.origin === queryOrigin || flight.origin.includes(queryOrigin);
    const matchesDestination =
      !queryDestination || flight.destination === queryDestination || flight.destination.includes(queryDestination);
    const matchesDate = !queryDate || flight.departDate === queryDate;
    const matchesCabin = !cabin || cabin === "Any" || flight.cabin === cabin;
    return matchesOrigin && matchesDestination && matchesDate && matchesCabin;
  });
};

export const getFlight = (id: string) => flights.find((flight) => flight.id === id);
