# Frontend Developer Guide - Search API

## 🚀 Quick Start

This guide provides everything you need to integrate the Search API into your frontend application.

**API Base URL:** `https://api.athithya.in` (or your backend URL)

---

## 📋 Table of Contents

1. [Available Endpoints](#available-endpoints)
2. [Quick Implementation](#quick-implementation)
3. [React/Next.js Examples](#reactnextjs-examples)
4. [Common Use Cases](#common-use-cases)
5. [Error Handling](#error-handling)
6. [TypeScript Support](#typescript-support)
7. [Best Practices](#best-practices)

---

## Available Endpoints

### 1. Basic Search
```
GET /api/search
```
Search across itineraries and experiences with filters.

### 2. Location-Based Search
```
GET /api/search/by-location
```
Get all content from a specific location.

### 3. Advanced Search
```
POST /api/search/advanced
```
Complex search with multiple criteria.

### 4. Autocomplete Suggestions
```
GET /api/search/suggestions
```
Get search suggestions as user types.

---

## Quick Implementation

### Simple Search Example (Vanilla JavaScript)

```javascript
// Basic search function
async function searchContent(query) {
  try {
    const response = await fetch(
      `https://api.athithya.in/api/search?q=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    
    if (data.success) {
      return data.data.results;
    }
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
}

// Usage
searchContent('mountain trek').then(results => {
  console.log(results);
});
```

### Search by Location (Vanilla JavaScript)

```javascript
async function getContentByLocation(location) {
  try {
    const response = await fetch(
      `https://api.athithya.in/api/search/by-location?location=${encodeURIComponent(location)}`
    );
    const data = await response.json();
    
    if (data.success) {
      return {
        itineraries: data.data.results.itineraries,
        experiences: data.data.results.experiences,
        total: data.data.summary.total
      };
    }
  } catch (error) {
    console.error('Location search failed:', error);
    return null;
  }
}

// Usage
getContentByLocation('Manali').then(data => {
  console.log(`Found ${data.total} results`);
  console.log('Itineraries:', data.itineraries);
  console.log('Experiences:', data.experiences);
});
```

---

## React/Next.js Examples

### 1. Basic Search Component

```jsx
'use client'; // For Next.js 13+ App Router

import { useState } from 'react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      
      if (data.success) {
        setResults(data.data.results);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search treks and experiences..."
          className="search-input"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <div className="results">
        {results.map((item) => (
          <div key={item._id} className="result-card">
            <img src={item.photos[0]?.url} alt={item.title} />
            <h3>{item.title}</h3>
            <p>{item.location?.city}, {item.location?.country}</p>
            <p className="price">₹{item.price?.perPerson}</p>
            <div className="rating">
              ⭐ {item.rating?.average} ({item.rating?.count} reviews)
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 2. Location Explorer with Tabs

```jsx
'use client';

import { useState, useEffect } from 'react';

export default function LocationExplorer({ locationName }) {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/search/by-location?location=${encodeURIComponent(locationName)}`
        );
        const result = await response.json();
        
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [locationName]);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No results found</div>;

  const currentResults = {
    all: data.results.all,
    itineraries: data.results.itineraries,
    experiences: data.results.experiences
  }[activeTab];

  return (
    <div className="location-explorer">
      <h1>{locationName}</h1>
      
      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === 'all' ? 'active' : ''}
          onClick={() => setActiveTab('all')}
        >
          All ({data.summary.total})
        </button>
        <button
          className={activeTab === 'itineraries' ? 'active' : ''}
          onClick={() => setActiveTab('itineraries')}
        >
          Itineraries ({data.summary.itineraries})
        </button>
        <button
          className={activeTab === 'experiences' ? 'active' : ''}
          onClick={() => setActiveTab('experiences')}
        >
          Experiences ({data.summary.experiences})
        </button>
      </div>

      {/* Results Grid */}
      <div className="grid">
        {currentResults.map((item) => (
          <Card key={item._id} item={item} />
        ))}
      </div>
    </div>
  );
}

function Card({ item }) {
  return (
    <div className="card">
      <img src={item.photos[0]?.url} alt={item.title} />
      <div className="content">
        <h3>{item.title}</h3>
        <p>{item.description?.substring(0, 100)}...</p>
        <p className="location">📍 {item.location?.city}</p>
        <p className="price">₹{item.price?.perPerson}</p>
        <span className="badge">
          {item.postType === 'plan' ? 'Itinerary' : 'Experience'}
        </span>
      </div>
    </div>
  );
}
```

### 3. Search with Filters Component

```jsx
'use client';

import { useState } from 'react';

export default function AdvancedSearch() {
  const [filters, setFilters] = useState({
    query: '',
    type: 'all',
    location: '',
    difficulty: '',
    minPrice: '',
    maxPrice: '',
    page: 1
  });
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key === 'query' ? 'q' : key, value);
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/search?${params}`
      );
      const data = await response.json();
      
      if (data.success) {
        setResults(data.data.results);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  return (
    <div className="advanced-search">
      {/* Search Input */}
      <input
        type="text"
        value={filters.query}
        onChange={(e) => updateFilter('query', e.target.value)}
        placeholder="Search..."
      />

      {/* Filters Row */}
      <div className="filters">
        <select
          value={filters.type}
          onChange={(e) => updateFilter('type', e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="itinerary">Itineraries</option>
          <option value="experience">Experiences</option>
        </select>

        <input
          type="text"
          value={filters.location}
          onChange={(e) => updateFilter('location', e.target.value)}
          placeholder="Location"
        />

        <select
          value={filters.difficulty}
          onChange={(e) => updateFilter('difficulty', e.target.value)}
        >
          <option value="">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Moderate">Moderate</option>
          <option value="Difficult">Difficult</option>
        </select>

        <input
          type="number"
          value={filters.minPrice}
          onChange={(e) => updateFilter('minPrice', e.target.value)}
          placeholder="Min Price"
        />

        <input
          type="number"
          value={filters.maxPrice}
          onChange={(e) => updateFilter('maxPrice', e.target.value)}
          placeholder="Max Price"
        />

        <button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Results */}
      <div className="results">
        {results.map((item) => (
          <ResultCard key={item._id} item={item} />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={!pagination.hasPrevPage}
            onClick={() => {
              setFilters(prev => ({ ...prev, page: prev.page - 1 }));
              handleSearch();
            }}
          >
            Previous
          </button>
          <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
          <button
            disabled={!pagination.hasNextPage}
            onClick={() => {
              setFilters(prev => ({ ...prev, page: prev.page + 1 }));
              handleSearch();
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
```

### 4. Autocomplete/Search Suggestions

```jsx
'use client';

import { useState, useEffect, useRef } from 'react';

export default function SearchAutocomplete({ onSelect }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  // Fetch suggestions
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/search/suggestions?q=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        
        if (data.success) {
          setSuggestions(data.data.suggestions);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Suggestions error:', error);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (suggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    if (onSelect) onSelect(suggestion);
  };

  return (
    <div ref={wrapperRef} className="autocomplete-wrapper">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        placeholder="Search destinations..."
        className="autocomplete-input"
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions-dropdown">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSelect(suggestion)}
              className="suggestion-item"
            >
              <div>
                <strong>{suggestion.text}</strong>
                <small>{suggestion.location} • {suggestion.type}</small>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## Common Use Cases

### Use Case 1: Homepage Search Bar

```jsx
// app/page.jsx
import SearchBar from '@/components/SearchBar';

export default function HomePage() {
  return (
    <div className="hero">
      <h1>Find Your Next Adventure</h1>
      <SearchBar />
    </div>
  );
}
```

### Use Case 2: Location Page

```jsx
// app/locations/[city]/page.jsx
import LocationExplorer from '@/components/LocationExplorer';

export default function LocationPage({ params }) {
  return <LocationExplorer locationName={params.city} />;
}
```

### Use Case 3: Explore Page with Filters

```jsx
// app/explore/page.jsx
import AdvancedSearch from '@/components/AdvancedSearch';

export default function ExplorePage() {
  return (
    <div>
      <h1>Explore Itineraries & Experiences</h1>
      <AdvancedSearch />
    </div>
  );
}
```

---

## Error Handling

### Proper Error Handling Pattern

```javascript
async function searchWithErrorHandling(query) {
  try {
    const response = await fetch(
      `${API_URL}/api/search?q=${encodeURIComponent(query)}`
    );
    
    // Check HTTP status
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check API success flag
    if (!data.success) {
      throw new Error(data.message || 'Search failed');
    }
    
    return {
      success: true,
      results: data.data.results,
      pagination: data.data.pagination
    };
    
  } catch (error) {
    console.error('Search error:', error);
    
    // Return user-friendly error
    return {
      success: false,
      error: 'Unable to complete search. Please try again.',
      results: []
    };
  }
}
```

### React Error Handling Component

```jsx
function SearchWithErrorHandling() {
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);

  const handleSearch = async (query) => {
    setError(null);
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/search?q=${query}`
      );
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setResults(data.data.results);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to search. Please check your connection.');
      console.error(err);
    }
  };

  return (
    <div>
      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
      {/* Search UI */}
    </div>
  );
}
```

---

## TypeScript Support

### Type Definitions

```typescript
// types/search.ts

export interface Location {
  city?: string;
  state?: string;
  country?: string;
  address?: string;
  coordinates?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export interface Photo {
  url: string;
  public_id: string;
  resource_type: 'image' | 'video';
}

export interface Price {
  amount?: number;
  perPerson?: number;
  total?: number;
  currency: string;
  period: 'night' | 'hour' | 'day' | 'person' | 'total';
}

export interface Rating {
  average: number;
  count: number;
}

export interface Duration {
  days?: number;
  nights?: number;
}

export interface User {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  avatar?: {
    url: string;
  };
  role: 'guest' | 'host';
}

export interface SearchResult {
  _id: string;
  title: string;
  subtitle?: string;
  description: string;
  postType: 'plan' | 'experience';
  photos: Photo[];
  videos?: Photo[];
  location: Location;
  duration?: Duration;
  difficulty?: 'Easy' | 'Easy-Moderate' | 'Moderate' | 'Moderate-Difficult' | 'Difficult' | 'Challenging';
  categories: string[];
  price: Price;
  rating: Rating;
  amenities?: string[];
  user: User;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  resultsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface SearchResponse {
  success: boolean;
  message: string;
  data: {
    results: SearchResult[];
    pagination: Pagination;
  };
}

export interface LocationSearchResponse {
  success: boolean;
  message: string;
  data: {
    location: string;
    summary: {
      total: number;
      itineraries: number;
      experiences: number;
    };
    results: {
      all: SearchResult[];
      itineraries: SearchResult[];
      experiences: SearchResult[];
    };
    pagination: Pagination;
  };
}

export interface SearchSuggestion {
  text: string;
  location: string;
  type: 'itinerary' | 'experience';
}

export interface SuggestionsResponse {
  success: boolean;
  data: {
    suggestions: SearchSuggestion[];
  };
}
```

### TypeScript Component Example

```typescript
// components/SearchBar.tsx
'use client';

import { useState } from 'react';
import type { SearchResult, SearchResponse } from '@/types/search';

export default function SearchBar() {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/search?q=${encodeURIComponent(query)}`
      );
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data: SearchResponse = await response.json();
      
      if (data.success) {
        setResults(data.data.results);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to search. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      <div className="results">
        {results.map((item) => (
          <ResultCard key={item._id} item={item} />
        ))}
      </div>
    </div>
  );
}

function ResultCard({ item }: { item: SearchResult }) {
  return (
    <div className="card">
      <img src={item.photos[0]?.url} alt={item.title} />
      <h3>{item.title}</h3>
      <p>{item.location.city}, {item.location.country}</p>
      <p>₹{item.price.perPerson}</p>
    </div>
  );
}
```

### API Helper with TypeScript

```typescript
// lib/searchApi.ts
import type { 
  SearchResponse, 
  LocationSearchResponse, 
  SuggestionsResponse 
} from '@/types/search';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class SearchAPI {
  static async search(
    query: string,
    filters: {
      type?: 'all' | 'itinerary' | 'experience';
      location?: string;
      difficulty?: string;
      minPrice?: number;
      maxPrice?: number;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<SearchResponse> {
    const params = new URLSearchParams({ q: query });
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await fetch(`${API_URL}/api/search?${params}`);
    if (!response.ok) throw new Error('Search failed');
    return response.json();
  }

  static async searchByLocation(
    location: string,
    type: 'all' | 'itinerary' | 'experience' = 'all',
    page: number = 1
  ): Promise<LocationSearchResponse> {
    const params = new URLSearchParams({ location, type, page: String(page) });
    const response = await fetch(`${API_URL}/api/search/by-location?${params}`);
    if (!response.ok) throw new Error('Location search failed');
    return response.json();
  }

  static async getSuggestions(query: string): Promise<SuggestionsResponse> {
    const response = await fetch(
      `${API_URL}/api/search/suggestions?q=${encodeURIComponent(query)}`
    );
    if (!response.ok) throw new Error('Suggestions failed');
    return response.json();
  }
}

// Usage
const data = await SearchAPI.search('mountain trek', { 
  type: 'itinerary',
  minPrice: 5000,
  maxPrice: 15000 
});
```

---

## Best Practices

### 1. **Debouncing Search Input**

```javascript
import { useState, useEffect } from 'react';

function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Usage in component
function SearchComponent() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery);
    }
  }, [debouncedQuery]);

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}
```

### 2. **Loading States**

```jsx
function SearchResults({ results, loading, error }) {
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p>Searching...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={retry}>Try Again</button>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="empty">
        <p>No results found. Try a different search.</p>
      </div>
    );
  }

  return (
    <div className="results-grid">
      {results.map(item => <Card key={item._id} item={item} />)}
    </div>
  );
}
```

### 3. **Caching Results**

```javascript
// Simple cache implementation
const searchCache = new Map();

async function searchWithCache(query) {
  // Check cache first
  if (searchCache.has(query)) {
    return searchCache.get(query);
  }

  // Fetch from API
  const response = await fetch(`/api/search?q=${query}`);
  const data = await response.json();

  // Store in cache
  if (data.success) {
    searchCache.set(query, data.data);
  }

  return data.data;
}
```

### 4. **Pagination Hook**

```javascript
function usePagination(initialPage = 1) {
  const [page, setPage] = useState(initialPage);

  const nextPage = () => setPage(p => p + 1);
  const prevPage = () => setPage(p => Math.max(1, p - 1));
  const goToPage = (pageNum) => setPage(pageNum);
  const reset = () => setPage(1);

  return { page, nextPage, prevPage, goToPage, reset };
}
```

### 5. **Environment Variables**

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.athithya.in
```

```javascript
// Use in components
const API_URL = process.env.NEXT_PUBLIC_API_URL;
```

---

## Quick Reference

### Query Parameters Cheat Sheet

```
Basic Search:
?q=query                    // Search text
&type=all|itinerary|experience
&location=city
&difficulty=Easy|Moderate|Difficult
&minPrice=5000
&maxPrice=15000
&sortBy=createdAt|rating|price
&sortOrder=asc|desc
&page=1
&limit=20

Location Search:
?location=city              // Required
&type=all|itinerary|experience
&page=1
&limit=20
```

### Response Structure Quick Reference

```javascript
{
  success: true,
  message: "...",
  data: {
    results: [...],         // Array of items
    pagination: {
      currentPage: 1,
      totalPages: 5,
      totalResults: 100,
      hasNextPage: true,
      hasPrevPage: false
    }
  }
}
```

---

## Support & Resources

- **Backend Documentation:** [SEARCH_API_DOCUMENTATION.md](./SEARCH_API_DOCUMENTATION.md)
- **API Base URL:** `https://api.athithya.in`
- **Issues:** Contact backend team

---

**Last Updated:** January 9, 2026  
**Version:** 1.0
