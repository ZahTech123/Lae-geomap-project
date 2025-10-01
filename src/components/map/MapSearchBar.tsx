import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchSuggestion {
  type: 'parcel' | 'address' | 'owner' | 'building';
  label: string;
  value: string;
  property: any;
}

interface MapSearchBarProps {
  properties: any[];
  onSelectProperty: (property: any) => void;
  onSearch: (searchTerm: string) => void;
}

const MapSearchBar: React.FC<MapSearchBarProps> = ({ 
  properties, 
  onSelectProperty,
  onSearch 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }

    const lowerSearch = searchTerm.toLowerCase();
    const results: SearchSuggestion[] = [];

    properties.forEach(property => {
      // Search parcel ID
      if (property.parcel_id?.toLowerCase().includes(lowerSearch)) {
        results.push({
          type: 'parcel',
          label: `Parcel: ${property.parcel_id}`,
          value: property.parcel_id,
          property
        });
      }

      // Search address
      if (property.address?.toLowerCase().includes(lowerSearch)) {
        results.push({
          type: 'address',
          label: `Address: ${property.address}`,
          value: property.address,
          property
        });
      }

      // Search owner name
      if (property.owner_name?.toLowerCase().includes(lowerSearch)) {
        results.push({
          type: 'owner',
          label: `Owner: ${property.owner_name}`,
          value: property.owner_name,
          property
        });
      }

      // Search building name
      if (property.building_name?.toLowerCase().includes(lowerSearch)) {
        results.push({
          type: 'building',
          label: `Building: ${property.building_name}`,
          value: property.building_name,
          property
        });
      }
    });

    // Limit to 8 suggestions
    setSuggestions(results.slice(0, 8));
  }, [searchTerm, properties]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(true);
    onSearch(value);
  };

  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    setSearchTerm(suggestion.label);
    setShowSuggestions(false);
    onSelectProperty(suggestion.property);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      handleSelectSuggestion(suggestions[0]);
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600" />
        <Input
          type="text"
          placeholder="Search properties by address, parcel ID, owner..."
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
          className="pl-10 pr-4 py-6 text-base font-medium bg-white text-gray-900 placeholder:text-gray-500 placeholder:font-normal shadow-lg border-0 rounded-full focus-visible:ring-2 focus-visible:ring-primary"
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-border max-h-80 overflow-y-auto z-50">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.type}-${index}`}
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-200 last:border-b-0 flex items-start gap-3"
            >
              <div className="flex-shrink-0 mt-0.5">
                {suggestion.type === 'parcel' && (
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                )}
                {suggestion.type === 'address' && (
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                )}
                {suggestion.type === 'owner' && (
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                )}
                {suggestion.type === 'building' && (
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">
                  {suggestion.label}
                </div>
                {suggestion.property.section && suggestion.property.lot && (
                  <div className="text-xs text-gray-600 font-medium mt-0.5">
                    Section {suggestion.property.section}, Lot {suggestion.property.lot}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MapSearchBar;
