export type Hotel = {
  id: string;
  name: string;
  city: string;
  location: string;
  rating: number;
  stars: number;
  price: number;
  reviewCount: number;
  image: string;
  roomsAvailable: number;
  amenities: string[];
  refundable: boolean;
  promotion: boolean;
  childFriendly: boolean;
  boardType: string;
};

const hotels: Hotel[] = [
  {
    id: "rht-h1001",
    name: "Hasdrubal Prestige Djerba",
    city: "Djerba",
    location: "Midoun",
    rating: 4.8,
    stars: 5,
    price: 220,
    reviewCount: 1248,
    image: "https://images.unsplash.com/photo-1501117716987-c8e2f0674603?auto=format&fit=crop&w=1400&q=80",
    roomsAvailable: 12,
    amenities: ["Beach club", "Spa", "Free breakfast"],
    refundable: true,
    promotion: true,
    childFriendly: true,
    boardType: "Demi Pension",
  },
  {
    id: "rht-h1002",
    name: "La Badira Hotel",
    city: "Hammamet",
    location: "Yasmine Hammamet",
    rating: 4.7,
    stars: 5,
    price: 180,
    reviewCount: 984,
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80",
    roomsAvailable: 9,
    amenities: ["Private beach", "Pool", "Wellness center"],
    refundable: false,
    promotion: true,
    childFriendly: false,
    boardType: "Demi Pension",
  },
  {
    id: "rht-h1003",
    name: "Golden Tulip Carthage",
    city: "Tunis",
    location: "La Marsa",
    rating: 4.5,
    stars: 4,
    price: 160,
    reviewCount: 812,
    image: "https://images.unsplash.com/photo-1499696019290-7d69f6e2f89f?auto=format&fit=crop&w=1400&q=80",
    roomsAvailable: 6,
    amenities: ["Sea view", "Buffet breakfast", "Gym"],
    refundable: true,
    promotion: false,
    childFriendly: true,
    boardType: "Breakfast",
  },
  {
    id: "rht-h1004",
    name: "Ksar Rouge Resort",
    city: "Toubkal",
    location: "South Desert",
    rating: 4.6,
    stars: 4,
    price: 245,
    reviewCount: 432,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80",
    roomsAvailable: 3,
    amenities: ["Desert camp", "Private excursions", "All meals"],
    refundable: false,
    promotion: false,
    childFriendly: false,
    boardType: "Full Board",
  },
  {
    id: "rht-h1005",
    name: "The Residence Tunis",
    city: "Tunis",
    location: "Gammarth",
    rating: 4.9,
    stars: 5,
    price: 275,
    reviewCount: 676,
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80",
    roomsAvailable: 8,
    amenities: ["Spa retreat", "Private beach club", "Fine dining"],
    refundable: true,
    promotion: true,
    childFriendly: true,
    boardType: "Half Board",
  },
];

export const searchHotels = ({
  city,
  guests,
  filters,
  rating,
}: {
  city: string;
  guests: number;
  filters: {
    recommended: boolean;
    promotion: boolean;
    childFriendly: boolean;
    availableOnly: boolean;
    refundable: boolean;
  };
  rating: number | null;
}) => {
  const queryCity = city.trim().toLowerCase();
  return hotels.filter((hotel) => {
    const matchesCity =
      !queryCity || hotel.city.toLowerCase().includes(queryCity) || hotel.location.toLowerCase().includes(queryCity);
    const matchesGuests = hotel.roomsAvailable > 0 && guests > 0;
    const matchesRecommended = !filters.recommended || hotel.rating >= 4.7;
    const matchesPromotion = !filters.promotion || hotel.promotion;
    const matchesChild = !filters.childFriendly || hotel.childFriendly;
    const matchesAvailable = !filters.availableOnly || hotel.roomsAvailable > 0;
    const matchesRefundable = !filters.refundable || hotel.refundable;
    const matchesRating = !rating || hotel.stars === rating;

    return (
      matchesCity &&
      matchesGuests &&
      matchesRecommended &&
      matchesPromotion &&
      matchesChild &&
      matchesAvailable &&
      matchesRefundable &&
      matchesRating
    );
  });
};

export const getHotel = (id: string) => hotels.find((hotel) => hotel.id === id);
