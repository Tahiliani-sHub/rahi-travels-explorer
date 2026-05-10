export type Train = {
  id: string;
  operator: string;
  trainNumber: string;
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  seatClass: "Economy" | "Business" | "First";
  seatsAvailable: number;
  price: number;
  refundable: boolean;
};

const trains: Train[] = [
  {
    id: "rht-t1001",
    operator: "SNCFT",
    trainNumber: "TN 121",
    origin: "TUN",
    destination: "SFA",
    departDate: "2026-06-08",
    departTime: "08:30",
    arriveTime: "11:20",
    duration: "2h 50m",
    seatClass: "Economy",
    seatsAvailable: 24,
    price: 45,
    refundable: true,
  },
  {
    id: "rht-t1002",
    operator: "SNCFT",
    trainNumber: "TN 225",
    origin: "TUN",
    destination: "SFA",
    departDate: "2026-06-08",
    departTime: "13:10",
    arriveTime: "15:50",
    duration: "2h 40m",
    seatClass: "Business",
    seatsAvailable: 12,
    price: 75,
    refundable: true,
  },
  {
    id: "rht-t1003",
    operator: "SNCFT",
    trainNumber: "TN 309",
    origin: "TUN",
    destination: "BZR",
    departDate: "2026-06-09",
    departTime: "10:00",
    arriveTime: "13:30",
    duration: "3h 30m",
    seatClass: "Economy",
    seatsAvailable: 30,
    price: 55,
    refundable: false,
  },
  {
    id: "rht-t1004",
    operator: "SNCFT",
    trainNumber: "TN 411",
    origin: "SFA",
    destination: "TUN",
    departDate: "2026-06-10",
    departTime: "17:05",
    arriveTime: "19:55",
    duration: "2h 50m",
    seatClass: "First",
    seatsAvailable: 8,
    price: 110,
    refundable: true,
  },
];

export const searchTrains = ({
  origin,
  destination,
  departDate,
  seatClass,
}: {
  origin: string;
  destination: string;
  departDate: string;
  seatClass: string;
}) => {
  const queryOrigin = origin.trim().toUpperCase();
  const queryDestination = destination.trim().toUpperCase();
  const queryDate = departDate.trim();

  return trains.filter((train) => {
    const matchesOrigin = !queryOrigin || train.origin === queryOrigin || train.origin.includes(queryOrigin);
    const matchesDestination =
      !queryDestination || train.destination === queryDestination || train.destination.includes(queryDestination);
    const matchesDate = !queryDate || train.departDate === queryDate;
    const matchesClass = !seatClass || seatClass === "Any" || train.seatClass === seatClass;
    return matchesOrigin && matchesDestination && matchesDate && matchesClass;
  });
};

export const getTrain = (id: string) => trains.find((train) => train.id === id);
