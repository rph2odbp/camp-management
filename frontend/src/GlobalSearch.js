// frontend/src/GlobalSearch.js
import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase-config'; // Import the shared functions instance

const searchUsersCallable = httpsCallable(functions, 'searchUsers'); // Use the imported instance

function GlobalSearch({ onSelectResult }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError('');
    setResults([]);

    try {
      const response = await searchUsersCallable({ query: searchTerm });
      setResults(response.data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="global-search-container">
      <form onSubmit={handleSearch}>
        <input
          type="search"
          placeholder="Search for anyone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? '...' : 'Search'}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
      {results.length > 0 && (
        <div className="search-results-modal">
          <ul>
            {results.map((result) => (
              <li key={result.id} onClick={() => onSelectResult(result.id)}>
                <strong>{result.name}</strong> ({result.email}) - <em>{result.type}</em>
              </li>
            ))}
          </ul>
          <button onClick={() => setResults([])}>Close</button>
        </div>
      )}
    </div>
  );
}

export default GlobalSearch;
