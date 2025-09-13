export const localStorageUtil = {
  getItem: <T = string>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return null;

      // Try to parse as JSON, if it fails return as string
      try {
        return JSON.parse(item) as T;
      } catch {
        return item as T;
      }
    } catch {
      return null;
    }
  },

  setItem: (key: string, value: string | object) => {
    try {
      if (typeof value === 'string') {
        localStorage.setItem(key, value);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error('Error setting localStorage item:', error);
    }
  },

  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing localStorage item:', error);
    }
  },
};
