let isEmbedded = false;
const listeners = new Set();

export const getEmbeddedState = () => isEmbedded;

export const setEmbeddedState = (value) => {
  if (isEmbedded !== value) {
    isEmbedded = value;
    notifyListeners();
  }
};

export const subscribeToEmbeddedState = (listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyListeners = () => {
  listeners.forEach(listener => {
    listener(isEmbedded);
  });
};

import { useState, useEffect } from 'react';

export const useEmbeddedState = () => {
  const [embedded, setEmbedded] = useState(getEmbeddedState());

  useEffect(() => {
    const unsubscribe = subscribeToEmbeddedState((value) => {
      setEmbedded(value);
    });
    
    return unsubscribe;
  }, []);

  return embedded;
};