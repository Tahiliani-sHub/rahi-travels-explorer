export type Tier = { name: string; price: number; perks: string[] };
export type ItineraryDay = { day: number; title: string; description: string };

export type Package = {
  id: string;
  name: string;
  duration: string;
  nights: number;
  price: number;
  category: string;
  rating: number;
  image: string;
  gallery: string[];
  tagline: string;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: ItineraryDay[];
  tiers: Tier[];
};

const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;

export const packages: Package[] = [
  {
    id: "sidi-bou-said-boutique-escape",
    name: "Sidi Bou Said Boutique Escape",
    duration: "3N4D",
    nights: 3,
    price: 520,
    category: "Culture",
    rating: 4.8,
    image: u("photo-1605281317010-fe5ffe798166"),
    gallery: [u("photo-1591115765373-5207764f72e7"), u("photo-1548019979-3d6f3e8c9e3a"), u("photo-1528154291023-a6525fabe5b4")],
    tagline: "Stay in an authentic Sidi Bou Said riad near the blue-and-white village and Mediterranean cliffs.",
    highlights: ["Boutique riad stay inspired by La Maison Blanche", "Sunset tea at Café des Nattes", "Private Carthage heritage tour"],
    inclusions: ["3 nights boutique riad", "Daily breakfast", "Private Carthage tour", "Airport transfers"],
    exclusions: ["International flights", "Lunch & dinner", "Personal expenses"],
    itinerary: [
      { day: 1, title: "Arrival in Tunis", description: "Transfer to your Sidi Bou Said riad and evening walk through the medina." },
      { day: 2, title: "Sidi Bou Said", description: "Visit art galleries, blue terraces and the Café des Nattes." },
      { day: 3, title: "Carthage Heritage", description: "Explore the Antonine Baths, Byrsa Hill and Punic ports." },
      { day: 4, title: "Departure", description: "Leisurely breakfast and transfer to Tunis airport." },
    ],
    tiers: [
      { name: "Classic", price: 520, perks: ["Boutique riad stay", "Breakfast", "Shared guided tour"] },
      { name: "Premium", price: 780, perks: ["Sea-view room", "Private guide", "Half board"] },
      { name: "Luxury", price: 1090, perks: ["Deluxe suite", "Private driver", "Welcome dinner"] },
    ],
  },
  {
    id: "djerba-hasdrubal-prestige",
    name: "Djerba Hasdrubal Prestige Retreat",
    duration: "5N6D",
    nights: 5,
    price: 1390,
    category: "Beach",
    rating: 4.8,
    image: u("photo-1507525428034-b723cf961d3e"),
    gallery: [u("photo-1519046904884-53103b34b206"), u("photo-1506744038136-46273834b3fb"), u("photo-1455587734955-081b22074882")],
    tagline: "Stay at the 5-star Hasdrubal Prestige Djerba with private beach, spa and island excursions.",
    highlights: ["Hasdrubal Prestige resort", "Houmt Souk craft tour", "Lagoon & flamingo outing"],
    inclusions: ["5 nights 5-star resort", "Breakfast", "Djerba island tour", "Transfers"],
    exclusions: ["Flights", "Spa treatments", "Tips"],
    itinerary: [
      { day: 1, title: "Arrival in Djerba", description: "Check in at Hasdrubal Prestige and relax by the sea." },
      { day: 2, title: "Houmt Souk", description: "Explore pottery, carpets and spice shops." },
      { day: 3, title: "Lagoon & Flamingos", description: "Discover Ras R'mel and the lagoon by boat." },
      { day: 4, title: "Beach Day", description: "Private cabana, pool and optional water sports." },
      { day: 5, title: "Heritage Tour", description: "Visit El Ghriba synagogue and island villages." },
      { day: 6, title: "Departure", description: "Transfer to Djerba–Zarzis airport." },
    ],
    tiers: [
      { name: "Prestige", price: 1390, perks: ["Garden room", "Breakfast"] },
      { name: "Executive", price: 1790, perks: ["Sea-view room", "Spa credit"] },
      { name: "Royal", price: 2290, perks: ["Suite", "Private boat excursion"] },
    ],
  },
  {
    id: "sahara-ksar-ghilane-camp",
    name: "Sahara Camp at Ksar Ghilane",
    duration: "4N5D",
    nights: 4,
    price: 1120,
    category: "Adventure",
    rating: 4.9,
    image: u("photo-1509316975850-ff9c5deb0cd9"),
    gallery: [u("photo-1473580044384-7ba9967e16a0"), u("photo-1547234935-80c7145ec969"), u("photo-1551524559-8af4e6624178")],
    tagline: "Camp at Ksar Ghilane, ride dunes and explore the Chott el Jerid salt flats.",
    highlights: ["Ksar Ghilane desert camp", "Berber caravan ride", "Star Wars Mos Espa locations"],
    inclusions: ["4 nights camp + oasis hotel", "All meals on safari", "4x4 driver-guide", "Camel ride"],
    exclusions: ["Flights", "Alcohol", "Optional sandboarding"],
    itinerary: [
      { day: 1, title: "Tunis to Douz", description: "Drive to Douz and cross into the Sahara." },
      { day: 2, title: "Ksar Ghilane", description: "Arrive at the desert camp and relax in the oasis." },
      { day: 3, title: "Chott el Jerid", description: "Explore salt lakes and Star Wars filming sites." },
      { day: 4, title: "Matmata", description: "Visit troglodyte cave homes and local villages." },
      { day: 5, title: "Return", description: "Drive back to Tunis with scenic stops." },
    ],
    tiers: [
      { name: "Classic", price: 1120, perks: ["Tent accommodation", "Shared 4x4"] },
      { name: "Comfort", price: 1590, perks: ["Luxury tent", "Private guide"] },
      { name: "Signature", price: 2120, perks: ["Boutique camp", "Private chef"] },
    ],
  },
  {
    id: "carthage-residence-tunis",
    name: "Carthage Heritage Stay at The Residence Tunis",
    duration: "2N3D",
    nights: 2,
    price: 420,
    category: "Culture",
    rating: 4.7,
    image: u("photo-1539020140153-e479b8c5dafa"),
    gallery: [u("photo-1564507592333-c60657eea523"), u("photo-1518684079-3c830dcef090"), u("photo-1528909514045-2fa4ac7a08ba")],
    tagline: "Elegant sea-view rooms at The Residence Tunis with private access to Carthage heritage sites.",
    highlights: ["Stay at The Residence Tunis", "Bardo Museum mosaics", "Carthage ruins tour"],
    inclusions: ["2 nights 5-star hotel", "Breakfast", "Private heritage tours", "Transfers"],
    exclusions: ["Flights", "Lunch/dinner upgrades", "Personal shopping"],
    itinerary: [
      { day: 1, title: "Arrival in Tunis", description: "Check in and relax at The Residence terrace." },
      { day: 2, title: "Carthage & Bardo", description: "Explore Bardo Museum and Carthage archaeological park." },
      { day: 3, title: "Medina & Departure", description: "Tunis medina walk before airport transfer." },
    ],
    tiers: [
      { name: "Classic", price: 420, perks: ["Superior room", "Guided tours"] },
      { name: "Signature", price: 690, perks: ["Sea-view room", "Private driver"] },
      { name: "Executive", price: 980, perks: ["Junior suite", "Personal concierge"] },
    ],
  },
  {
    id: "hammamet-la-badira-beach",
    name: "Hammamet La Badira Beach Escape",
    duration: "4N5D",
    nights: 4,
    price: 880,
    category: "Beach",
    rating: 4.9,
    image: u("photo-1519046904884-53103b34b206"),
    gallery: [u("photo-1507525428034-b723cf961d3e"), u("photo-1502920917128-1aa500764cbd"), u("photo-1520454974749-611b7248ffdb")],
    tagline: "Stay at La Badira Hammamet with private beach, marina access and spa wellness.",
    highlights: ["La Badira beachfront resort", "Yasmine Hammamet marina", "Old medina kasbah tour"],
    inclusions: ["4 nights 5-star resort", "Half board", "Medina tour", "Transfers"],
    exclusions: ["Flights", "Watersports extras", "Drinks"],
    itinerary: [
      { day: 1, title: "Arrival in Hammamet", description: "Check in at La Badira and unwind by the pool." },
      { day: 2, title: "Old Medina", description: "Kasbah and souk walk with seaside views." },
      { day: 3, title: "Yasmine Marina", description: "Boat ride and marina-side lunch." },
      { day: 4, title: "Beach & Spa", description: "Private cabana, spa session or leisure beach time." },
      { day: 5, title: "Departure", description: "Transfer to Tunis airport after a relaxed morning." },
    ],
    tiers: [
      { name: "Premium", price: 880, perks: ["Sea-view room", "Half board"] },
      { name: "Deluxe", price: 1190, perks: ["Superior suite", "Spa voucher"] },
      { name: "Elite", price: 1690, perks: ["Luxury suite", "Private boat day"] },
    ],
  },
  {
    id: "tozeur-oasis-star-wars",
    name: "Tozeur Oasis & Star Wars Trail",
    duration: "3N4D",
    nights: 3,
    price: 780,
    category: "Adventure",
    rating: 4.8,
    image: u("photo-1473580044384-7ba9967e16a0"),
    gallery: [u("photo-1509316975850-ff9c5deb0cd9"), u("photo-1547234935-80c7145ec969"), u("photo-1518684079-3c830dcef090")],
    tagline: "Palm-lined oases, salt lakes and Tatooine film locations.",
    highlights: ["Chott el Jerid salt flats", "Star Wars Mos Espa set", "Chebika & Tamerza canyons"],
    inclusions: ["3 nights desert hotel", "Breakfast & one dinner", "4x4 oasis circuit", "Transfers"],
    exclusions: ["Flights", "Alcohol", "Camel rides"],
    itinerary: [
      { day: 1, title: "Arrive Tozeur", description: "Sunset over the palmeraie." },
      { day: 2, title: "Mountain Oases", description: "Chebika, Tamerza and Mides canyons." },
      { day: 3, title: "Star Wars Trail", description: "Mos Espa set across Chott el Jerid." },
      { day: 4, title: "Departure", description: "Return flight or drive to Tunis." },
    ],
    tiers: [
      { name: "Standard", price: 780, perks: ["Boutique hotel", "Shared 4x4"] },
      { name: "Deluxe", price: 1190, perks: ["Eco-lodge", "Private 4x4"] },
      { name: "Premium", price: 1690, perks: ["Luxury dar", "Private guide & chef"] },
    ],
  },
  {
    id: "hasdrubal-thalassa-hammamet",
    name: "Hasdrubal Thalassa Wellness Retreat",
    duration: "5N6D",
    nights: 5,
    price: 1490,
    category: "Wellness",
    rating: 4.9,
    image: u("photo-1540555700478-4be289fbecef"),
    gallery: [u("photo-1544161515-4ab6ce6db874"), u("photo-1556228453-efd6c1ff04f6"), u("photo-1519823551278-64ac92734fb1")],
    tagline: "Rejuvenate at Hasdrubal Thalassa Hammamet with seawater therapy, hammam rituals and seaside wellness.",
    highlights: ["Seawater thalasso circuit", "Spa & hammam rituals", "Yoga and wellness cuisine"],
    inclusions: ["5 nights 5-star spa resort", "Full board", "12 thalasso treatments", "Transfers"],
    exclusions: ["Flights", "Extra spa services", "Alcohol"],
    itinerary: [
      { day: 1, title: "Arrival & Consultation", description: "Wellness assessment and welcome seawater session." },
      { day: 2, title: "Seawater Therapy", description: "Affusion showers, jet baths and hydrotherapy." },
      { day: 3, title: "Hammam Ritual", description: "Black soap scrub and aromatic massage." },
      { day: 4, title: "Active Wellness", description: "Yoga, guided beach walk and aqua fitness." },
      { day: 5, title: "Detox", description: "Algotherapy wrap and meditation." },
      { day: 6, title: "Departure", description: "Final treatment and airport transfer." },
    ],
    tiers: [
      { name: "Classic", price: 1490, perks: ["Spa room", "12 treatments"] },
      { name: "Deluxe", price: 1990, perks: ["Sea-view suite", "18 treatments"] },
      { name: "Royal", price: 2790, perks: ["Luxury suite", "Personal therapist"] },
    ],
  },
  {
    id: "tunisia-grand-tour",
    name: "Full Tunisia Grand Tour",
    duration: "10N11D",
    nights: 10,
    price: 2800,
    category: "All-inclusive",
    rating: 5.0,
    image: u("photo-1528909514045-2fa4ac7a08ba"),
    gallery: [u("photo-1539020140153-e479b8c5dafa"), u("photo-1509316975850-ff9c5deb0cd9"), u("photo-1507525428034-b723cf961d3e")],
    tagline: "From Carthage to the Sahara — the definitive Tunisia journey.",
    highlights: ["Tunis, Carthage & Sidi Bou Said", "Sahara overnight camp", "Djerba beach finale"],
    inclusions: ["10 nights mixed lodging", "Daily breakfast + 6 dinners", "Private guide & driver", "All transfers"],
    exclusions: ["International flights", "Optional excursions", "Personal shopping"],
    itinerary: [
      { day: 1, title: "Tunis Arrival", description: "Welcome and medina walk." },
      { day: 2, title: "Carthage & Sidi Bou Said", description: "Heritage day in the capital." },
      { day: 3, title: "Dougga", description: "Roman ruins UNESCO site." },
      { day: 4, title: "Kairouan", description: "Holy city and Great Mosque." },
      { day: 5, title: "El Jem", description: "Colossal Roman amphitheater." },
      { day: 6, title: "Tozeur", description: "Oasis circuit and palmeraie." },
      { day: 7, title: "Sahara Camp", description: "Camel trek and dune bivouac." },
      { day: 8, title: "Matmata", description: "Troglodyte cave homes." },
      { day: 9, title: "Djerba", description: "Beach day and Houmt Souk." },
      { day: 10, title: "Hammamet", description: "Coastal leisure stop." },
      { day: 11, title: "Departure", description: "Transfer to airport." },
    ],
    tiers: [
      { name: "Standard", price: 2800, perks: ["4-star average", "Group of 12"] },
      { name: "Deluxe", price: 3990, perks: ["5-star average", "Small group of 6"] },
      { name: "Premium", price: 5490, perks: ["Luxury throughout", "Fully private"] },
    ],
  },
];

export const getPackage = (id: string) => packages.find((p) => p.id === id);
export const categories = ["Beach", "Desert", "Heritage", "Wellness", "Adventure", "Culture", "All-inclusive"];
