'use client';

import { useEffect } from 'react';
import { initializeDatabase } from '../../services/supabaseClient';

export default function DatabaseInitializer() {
  useEffect(() => {
    // Initialize database tables on app startup
    const initialize = async () => {
      try {
        await initializeDatabase();
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };
    
    initialize();
  }, []);

  // This component doesn't render anything
  return null;
}
