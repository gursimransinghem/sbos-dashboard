import { useState, useEffect } from 'react';

export function useData(jsonPath, fallback = []) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(jsonPath)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load ${jsonPath}`);
        return res.json();
      })
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [jsonPath]);

  return { data, loading, error };
}
