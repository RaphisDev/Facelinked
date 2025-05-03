// EmbeddedStateManager.js
// A simple utility to manage the embedded state across the application

let isEmbedded = false;
const listeners = new Set();

// Function to get the current embedded state
export const getEmbeddedState = () => isEmbedded;

// Function to set the embedded state and notify listeners
export const setEmbeddedState = (value) => {
  if (isEmbedded !== value) {
    isEmbedded = value;
    notifyListeners();
  }
};

// Function to subscribe to changes in the embedded state
export const subscribeToEmbeddedState = (listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

// Function to notify all listeners of a change in the embedded state
const notifyListeners = () => {
  listeners.forEach(listener => {
    listener(isEmbedded);
  });
};

// Custom hook to use the embedded state in React components
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