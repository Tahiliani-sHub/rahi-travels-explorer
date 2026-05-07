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
    id: "sidi-bou-said-escape",
    name: "Sidi Bou Said Escape",
    duration: "3N4D",
    nights: 3,
    price: 450,
    category: "Culture",
    rating: 4.7,
    image: u("photo-1605281317010-fe5ffe798166"),
    gallery: [u("photo-1591115765373-5207764f72e7"), u("photo-1548019979-3d6f3e8c9e3a"), u("photo-1528154291023-a6525fabe5b4")],
    tagline: "Blue & white village above the Mediterranean.",
    highlights: ["Iconic blue-and-white medina", "Cliffside cafés & art galleries", "Carthage day excursion"],
    inclusions: ["3 nights boutique stay", "Daily breakfast", "Carthage guided tour", "Airport transfers"],
    exclusions: ["International flights", "Lunch & dinner", "Personal expenses"],
    itinerary: [
      { day: 1, title: "Arrival in Tunis", description: "Welcome transfer, evening stroll on Rue Habib Bourguiba." },
      { day: 2, title: "Sidi Bou Said", description: "Explore galleries, Café des Nattes, sunset at the cliff." },
      { day: 3, title: "Carthage Heritage", description: "Antonine Baths, Punic Ports and Carthage Museum." },
      { day: 4, title: "Departure", description: "Leisure morning, transfer to airport." },
    ],
    tiers: [
      { name: "Standard", price: 450, perks: ["3-star stay", "Breakfast", "Group tour"] },
      { name: "Deluxe", price: 690, perks: ["4-star stay", "Half board", "Private guide"] },
      { name: "Premium", price: 990, perks: ["5-star boutique", "Full board", "Private vehicle"] },
    ],
  },
  {
    id: "djerba-island-retreat",
    name: "Djerba Island Retreat",
    duration: "5N6D",
    nights: 5,
    price: 890,
    category: "Beach",
    rating: 4.8,
    image: u("photo-1507525428034-b723cf961d3e"),
    gallery: [u("photo-1519046904884-53103b34b206"), u("photo-1506744038136-46273834b3fb"), u("photo-1455587734955-081b22074882")],
    tagline: "Sun-soaked island of soft sands and whitewashed villages.",
    highlights: ["Powder-white beaches", "Houmt Souk craft markets", "Flamingo lagoons & dunes"],
    inclusions: ["5 nights resort", "All-inclusive board", "Island jeep tour", "Transfers"],
    exclusions: ["Flights", "Spa treatments", "Tips"],
    itinerary: [
      { day: 1, title: "Arrival in Djerba", description: "Beachfront welcome and sunset cocktail." },
      { day: 2, title: "Houmt Souk", description: "Pottery, silver and spice market tour." },
      { day: 3, title: "Lagoon & Flamingos", description: "Ras R'mel pink-flamingo trail." },
      { day: 4, title: "Beach Day", description: "Watersports or full leisure." },
      { day: 5, title: "El Ghriba", description: "Visit historic synagogue and old quarters." },
      { day: 6, title: "Departure", description: "Transfer to airport." },
    ],
    tiers: [
      { name: "Standard", price: 890, perks: ["4-star resort", "All-inclusive"] },
      { name: "Deluxe", price: 1290, perks: ["5-star resort", "Beach villa", "Spa credit"] },
      { name: "Premium", price: 1890, perks: ["Luxury suite", "Private butler", "Yacht trip"] },
    ],
  },
  {
    id: "sahara-desert-expedition",
    name: "Sahara Desert Expedition",
    duration: "4N5D",
    nights: 4,
    price: 1200,
    category: "Adventure",
    rating: 4.9,
    image: u("photo-1509316975850-ff9c5deb0cd9"),
    gallery: [u("photo-1473580044384-7ba9967e16a0"), u("photo-1547234935-80c7145ec969"), u("photo-1551524559-8af4e6624178")],
    tagline: "Dunes, oases and starlit nights deep in the Sahara.",
    highlights: ["Camel trek into Erg Chebbi-style dunes", "Berber camp under the stars", "4x4 oasis circuit"],
    inclusions: ["4 nights mixed (hotel + camp)", "All meals on safari", "4x4 driver-guide", "Camel ride"],
    exclusions: ["Flights", "Alcohol", "Optional sandboarding"],
    itinerary: [
      { day: 1, title: "Tunis to Douz", description: "Scenic drive to the gateway of the Sahara." },
      { day: 2, title: "Camel Trek", description: "Sunset ride to a Berber bivouac camp." },
      { day: 3, title: "Ksar Ghilane", description: "Hot springs oasis and dune landscapes." },
      { day: 4, title: "Matmata Cave Homes", description: "Star Wars filming site & troglodyte villages." },
      { day: 5, title: "Return", description: "Drive back to Tunis." },
    ],
    tiers: [
      { name: "Standard", price: 1200, perks: ["Shared 4x4", "Standard camp"] },
      { name: "Deluxe", price: 1690, perks: ["Private 4x4", "Luxury tented camp"] },
      { name: "Premium", price: 2390, perks: ["Helicopter scenic", "Private chef camp"] },
    ],
  },
  {
    id: "carthage-heritage-tour",
    name: "Carthage Heritage Tour",
    duration: "2N3D",
    nights: 2,
    price: 320,
    category: "Heritage",
    rating: 4.6,
    image: u("photo-1539020140153-e479b8c5dafa"),
    gallery: [u("photo-1564507592333-c60657eea523"), u("photo-1518684079-3c830dcef090"), u("photo-1528909514045-2fa4ac7a08ba")],
    tagline: "Walk through 3,000 years of Phoenician and Roman history.",
    highlights: ["Antonine Baths", "Bardo Museum mosaics", "Punic harbor & amphitheater"],
    inclusions: ["2 nights Tunis hotel", "Breakfast", "Heritage guided tours", "Transfers"],
    exclusions: ["Flights", "Meals not specified", "Souvenirs"],
    itinerary: [
      { day: 1, title: "Arrival & Bardo", description: "Visit world-famous Bardo mosaics museum." },
      { day: 2, title: "Carthage Sites", description: "Antonine Baths, Punic Ports, Byrsa Hill." },
      { day: 3, title: "Medina & Departure", description: "Tunis medina walk before transfer." },
    ],
    tiers: [
      { name: "Standard", price: 320, perks: ["3-star stay", "Group tour"] },
      { name: "Deluxe", price: 520, perks: ["4-star stay", "Private guide"] },
      { name: "Premium", price: 790, perks: ["5-star stay", "Egyptologist-level guide"] },
    ],
  },
  {
    id: "hammamet-beach-medina",
    name: "Hammamet Beach & Medina",
    duration: "4N5D",
    nights: 4,
    price: 670,
    category: "Beach",
    rating: 4.7,
    image: u("photo-1519046904884-53103b34b206"),
    gallery: [u("photo-1507525428034-b723cf961d3e"), u("photo-1502920917128-1aa500764cbd"), u("photo-1520454974749-611b7248ffdb")],
    tagline: "Turquoise bays paired with a charming whitewashed medina.",
    highlights: ["Yasmine Hammamet marina", "Old medina & kasbah", "Beach club afternoons"],
    inclusions: ["4 nights beach resort", "Half board", "Medina tour", "Transfers"],
    exclusions: ["Flights", "Watersports", "Drinks"],
    itinerary: [
      { day: 1, title: "Arrival", description: "Beach check-in and welcome dinner." },
      { day: 2, title: "Medina Walk", description: "Kasbah, souks and seafront fortress." },
      { day: 3, title: "Yasmine Marina", description: "Boat trip and Carthageland family time." },
      { day: 4, title: "Free Day", description: "Optional thalasso or beach leisure." },
      { day: 5, title: "Departure", description: "Transfer to airport." },
    ],
    tiers: [
      { name: "Standard", price: 670, perks: ["4-star resort", "Half board"] },
      { name: "Deluxe", price: 990, perks: ["5-star resort", "Sea-view room"] },
      { name: "Premium", price: 1490, perks: ["Suite", "Private boat day"] },
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
    id: "thalasso-wellness-retreat",
    name: "Thalassotherapy Wellness Retreat",
    duration: "5N6D",
    nights: 5,
    price: 1450,
    category: "Wellness",
    rating: 4.9,
    image: u("photo-1540555700478-4be289fbecef"),
    gallery: [u("photo-1544161515-4ab6ce6db874"), u("photo-1556228453-efd6c1ff04f6"), u("photo-1519823551278-64ac92734fb1")],
    tagline: "Tunisia is a world thalassotherapy capital — recharge by the sea.",
    highlights: ["Daily seawater treatments", "Mediterranean spa cuisine", "Yoga & hammam rituals"],
    inclusions: ["5 nights spa resort", "Full board", "12 thalasso treatments", "Transfers"],
    exclusions: ["Flights", "Extra spa add-ons", "Alcohol"],
    itinerary: [
      { day: 1, title: "Arrival & Diagnostic", description: "Wellness consultation and welcome ritual." },
      { day: 2, title: "Hydrotherapy", description: "Affusion showers, jet baths, seawater pool." },
      { day: 3, title: "Hammam Day", description: "Traditional black-soap ritual and massage." },
      { day: 4, title: "Active Wellness", description: "Yoga, beach walk and aqua-gym." },
      { day: 5, title: "Detox", description: "Algotherapy wraps and meditation." },
      { day: 6, title: "Departure", description: "Final treatment and transfer." },
    ],
    tiers: [
      { name: "Standard", price: 1450, perks: ["4-star spa", "12 treatments"] },
      { name: "Deluxe", price: 1990, perks: ["5-star spa", "18 treatments"] },
      { name: "Premium", price: 2790, perks: ["Suite", "Personal therapist"] },
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
