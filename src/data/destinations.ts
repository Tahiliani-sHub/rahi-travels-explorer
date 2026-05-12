export type Destination = {
  code: string;
  name: string;
  country: string;
  type: 'flight' | 'hotel' | 'train' | 'holiday' | 'all';
};

export const popularDestinations: Destination[] = [
  // Tunisia Airports
  { code: 'TUN', name: 'Tunis', country: 'Tunisia', type: 'flight' },
  { code: 'DJE', name: 'Djerba', country: 'Tunisia', type: 'flight' },
  { code: 'MIR', name: 'Monastir', country: 'Tunisia', type: 'flight' },
  { code: 'NBE', name: 'Nabel', country: 'Tunisia', type: 'flight' },
  { code: 'TAT', name: 'Tataouine', country: 'Tunisia', type: 'flight' },

  // International Airports
  { code: 'CDG', name: 'Paris', country: 'France', type: 'flight' },
  { code: 'LHR', name: 'London', country: 'United Kingdom', type: 'flight' },
  { code: 'MXP', name: 'Milan', country: 'Italy', type: 'flight' },
  { code: 'DXB', name: 'Dubai', country: 'UAE', type: 'flight' },
  { code: 'BJS', name: 'Beijing', country: 'China', type: 'flight' },

  // Hotels
  { code: 'djerba', name: 'Djerba', country: 'Tunisia', type: 'hotel' },
  { code: 'hammamet', name: 'Hammamet', country: 'Tunisia', type: 'hotel' },
  { code: 'sousse', name: 'Sousse', country: 'Tunisia', type: 'hotel' },
  { code: 'sidi-bou-said', name: 'Sidi Bou Saïd', country: 'Tunisia', type: 'hotel' },
  { code: 'tunis', name: 'Tunis', country: 'Tunisia', type: 'hotel' },
  { code: 'kairouan', name: 'Kairouan', country: 'Tunisia', type: 'hotel' },
  { code: 'douz', name: 'Douz', country: 'Tunisia', type: 'hotel' },

  // Train Stations
  { code: 'tunis-central', name: 'Tunis Central', country: 'Tunisia', type: 'train' },
  { code: 'sousse-main', name: 'Sousse Main', country: 'Tunisia', type: 'train' },
  { code: 'sfax-main', name: 'Sfax Main', country: 'Tunisia', type: 'train' },
];

export const getDestinationsByType = (type: 'flight' | 'hotel' | 'train' | 'holiday') => {
  return popularDestinations.filter(d => d.type === type || d.type === 'hotel' || d.type === 'all');
};

export const searchDestinations = (query: string, type?: 'flight' | 'hotel' | 'train' | 'holiday') => {
  const destinations = type ? getDestinationsByType(type) : popularDestinations;
  const lowerQuery = query.toLowerCase();

  return destinations.filter(d =>
    d.code.toLowerCase().includes(lowerQuery) ||
    d.name.toLowerCase().includes(lowerQuery) ||
    d.country.toLowerCase().includes(lowerQuery)
  );
};
