const PREFERENCES_KEY = 'preferences';

const DEFAULT_PREFERENCES = {
  applyFilters: false,
  deepness: 5,
};

export const useLocalStorage = () => {
  const getPreferences = () => {
    const preferences = localStorage.getItem(PREFERENCES_KEY);

    return preferences != null
      ? { ...DEFAULT_PREFERENCES, ...JSON.parse(preferences) }
      : { ...DEFAULT_PREFERENCES };
  };

  const updatePreferences = (partialPreferences: any) => {
    const preferences = getPreferences();

    return localStorage.setItem(
      PREFERENCES_KEY,
      JSON.stringify({ ...preferences, ...partialPreferences })
    );
  };

  const getItem = (key: string) => {
    return localStorage.getItem(key);
  };

  const setItem = (key: string, value: any) => {
    return localStorage.setItem(key, value);
  };

  return {
    getPreferences,
    updatePreferences,
    getItem,
    setItem,
  };
};
