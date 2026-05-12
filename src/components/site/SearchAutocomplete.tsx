import { useState, useRef, useEffect } from 'react';
import { Search, Clock, MapPin, X } from 'lucide-react';
import { searchDestinations, type Destination } from '@/data/destinations';

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'flight' | 'hotel' | 'train' | 'holiday';
  onSelect?: (destination: Destination) => void;
}

export function SearchAutocomplete({
  value,
  onChange,
  placeholder = 'Enter destination...',
  type,
  onSelect
}: SearchAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Destination[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const storageKey = `recent_${type || 'all'}_searches`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored).slice(0, 5));
      } catch (e) {
        console.error('Failed to load recent searches:', e);
      }
    }
  }, [type]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (newValue.trim()) {
      const results = searchDestinations(newValue, type);
      setSuggestions(results);
      setShowDropdown(true);
    } else {
      setSuggestions([]);
      setShowDropdown(true);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (dest: Destination) => {
    onChange(dest.code);
    setShowDropdown(false);

    // Save to recent searches
    const storageKey = `recent_${type || 'all'}_searches`;
    const stored = localStorage.getItem(storageKey);
    let searches: string[] = [];
    if (stored) {
      try {
        searches = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse recent searches:', e);
      }
    }

    const filtered = searches.filter(s => s !== dest.code);
    const updated = [dest.code, ...filtered].slice(0, 5);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setRecentSearches(updated);

    onSelect?.(dest);
  };

  // Handle recent search click
  const handleRecentClick = (search: string) => {
    onChange(search);
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-4 top-3 text-gray-400" size={16} />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
        />
        {value && (
          <button
            onClick={() => {
              onChange('');
              setSuggestions([]);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {value.trim() && suggestions.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                Destinations
              </div>
              {suggestions.map((dest, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(dest)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 flex items-center gap-3 transition"
                >
                  <MapPin size={16} className="text-gray-400 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{dest.code}</div>
                    <div className="text-xs text-gray-500">{dest.name} {dest.country && `• ${dest.country}`}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!value.trim() && recentSearches.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                Recent Searches
              </div>
              {recentSearches.map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRecentClick(search)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 flex items-center gap-3 transition"
                >
                  <Clock size={16} className="text-gray-400" />
                  <span className="text-sm font-medium">{search}</span>
                </button>
              ))}
            </div>
          )}

          {value.trim() && suggestions.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              No destinations found. Try a different search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
