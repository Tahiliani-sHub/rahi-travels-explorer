export type Holiday = {
  id: string;
  name: string;
  destination: string;
  nights: number;
  price: number;
  category: string;
  rating: number;
  image: string;
  tagline: string;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  availableDates: string[];
};

const holidays: Holiday[] = [
  {
    id: "rht-hol-1001",
    name: "Sahara Magic Escape",
    destination: "Douz",
    nights: 3,
    price: 680,
    category: "Desert",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
    tagline: "A private Sahara experience with camp stay and sunset dunes.",
    highlights: ["Luxury desert camp", "Sunset camel ride", "Starlit dinner"],
    inclusions: ["3 nights camp", "All meals", "Camel ride", "Pickup/drop-off"],
    exclusions: ["International flights", "Travel insurance", "Personal expenses"],
    availableDates: ["2026-06-08", "2026-06-22", "2026-07-06"],
  },
  {
    id: "rht-hol-1002",
    name: "Mediterranean Wellness Retreat",
    destination: "Hammamet",
    nights: 5,
    price: 1190,
    category: "Wellness",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1501117716987-c8e2f0674603?auto=format&fit=crop&w=1400&q=80",
    tagline: "Thalasso spa days and coastal tranquility in northern Tunisia.",
    highlights: ["Spa treatments", "Private beach", "Healthy dining"],
    inclusions: ["5 nights hotel", "Breakfast", "Spa package", "Transfers"],
    exclusions: ["Flights", "Personal spa upgrades", "Alcohol"],
    availableDates: ["2026-06-15", "2026-07-01", "2026-07-20"],
  },
  {
    id: "rht-hol-1003",
    name: "Carthage Heritage Journey",
    destination: "Tunis",
    nights: 4,
    price: 920,
    category: "Culture",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1548019979-3d6f3e8c9e3a?auto=format&fit=crop&w=1400&q=80",
    tagline: "Discover ancient Carthage and the Mediterranean coast with expert guides.",
    highlights: ["Carthage ruins", "Medina walk", "Local cuisine tasting"],
    inclusions: ["4 nights hotel", "Guided tours", "Breakfast", "Airport transfer"],
    exclusions: ["International flights", "Lunch/dinner", "Personal shopping"],
    availableDates: ["2026-06-12", "2026-06-26", "2026-07-10"],
  },
];

export const searchHolidays = ({ destination, date, guests }: { destination: string; date: string; guests: number }) => {
  const queryDestination = destination.trim().toLowerCase();
  const queryDate = date.trim();
  return holidays.filter((holiday) => {
    const matchesDestination =
      !queryDestination || holiday.destination.toLowerCase().includes(queryDestination) || holiday.name.toLowerCase().includes(queryDestination);
    const matchesDate = !queryDate || holiday.availableDates.includes(queryDate);
    const matchesGuests = guests > 0;
    return matchesDestination && matchesDate && matchesGuests;
  });
};

export const getHoliday = (id: string) => holidays.find((holiday) => holiday.id === id);
