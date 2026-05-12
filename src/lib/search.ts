export type SortOption = 'price-asc' | 'price-desc' | 'duration-asc' | 'stops-asc' | 'rating-desc';

export type SearchFilters = {
  minPrice?: number;
  maxPrice?: number;
  maxStops?: number;
  airlines?: string[];
  minRating?: number;
  cabins?: string[];
};

export function filterResults<T extends Record<string, any>>(
  items: T[],
  filters: SearchFilters
): T[] {
  return items.filter(item => {
    if (filters.minPrice !== undefined && item.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice !== undefined && item.price > filters.maxPrice) {
      return false;
    }
    if (filters.maxStops !== undefined && item.stops !== undefined && item.stops > filters.maxStops) {
      return false;
    }
    if (filters.airlines && filters.airlines.length > 0 && !filters.airlines.includes(item.airline)) {
      return false;
    }
    if (filters.cabins && filters.cabins.length > 0 && !filters.cabins.includes(item.cabin)) {
      return false;
    }
    if (filters.minRating !== undefined && item.rating !== undefined && item.rating < filters.minRating) {
      return false;
    }
    return true;
  });
}

export function sortResults<T extends Record<string, any>>(
  items: T[],
  sortBy: SortOption
): T[] {
  const sorted = [...items];

  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    case 'price-desc':
      return sorted.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    case 'duration-asc':
      return sorted.sort((a, b) => {
        const durationA = a.duration ? parseDuration(a.duration) : Infinity;
        const durationB = b.duration ? parseDuration(b.duration) : Infinity;
        return durationA - durationB;
      });
    case 'stops-asc':
      return sorted.sort((a, b) => (a.stops ?? 0) - (b.stops ?? 0));
    case 'rating-desc':
      return sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    default:
      return sorted;
  }
}

function parseDuration(duration: string): number {
  if (!duration) return 0;
  const match = duration.match(/PT(\d+)H(\d+)M/);
  if (!match) return 0;
  return parseInt(match[1]) * 60 + parseInt(match[2]);
}

export function applySearchFiltersAndSort<T extends Record<string, any>>(
  items: T[],
  filters?: SearchFilters,
  sortBy?: SortOption
): T[] {
  let result = items;

  if (filters) {
    result = filterResults(result, filters);
  }

  if (sortBy) {
    result = sortResults(result, sortBy);
  }

  return result;
}
