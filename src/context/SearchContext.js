// src/context/SearchContext.js

"use client";
import { createContext, useContext, useState } from 'react';
import { useRouter } from 'next/navigation';

const SearchContext = createContext();

export function SearchProvider({ children }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchRecommendations = async (preferences) => {
    setLoading(true);
    setResults(null);
    setError("");

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to get recommendations.');
      }

      const recommendations = await response.json();
      setResults(recommendations);
      router.push('/search-results');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SearchContext.Provider value={{ results, loading, error, fetchRecommendations }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  return useContext(SearchContext);
}