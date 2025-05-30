import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qdyjfdruhrpcwwmdwpzd.supabase.co'; // replace with yours
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeWpmZHJ1aHJwY3d3bWR3cHpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzMTcxMDIsImV4cCI6MjA2MTg5MzEwMn0.rAXHAnIiOlhuNPIHqNNzzXXGzZNNhcWLsbFO-PsJXiQ';

// Disable WebSocket features to avoid `ws` dependency
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch, // polyfilled by 'react-native-url-polyfill'
  },
  realtime: {
    // Completely disable ws/websocket
    enabled: false,
  },
});