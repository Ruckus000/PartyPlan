import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

console.log('🔧 Supabase Configuration:');
console.log('  URL:', supabaseUrl);
console.log('  Key exists:', !!supabaseAnonKey);
console.log('  Key length:', supabaseAnonKey?.length);

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-react-native',
      },
      fetch: (url, options = {}) => {
        // React Native only supports: method, headers, body, signal
        // Filter out unsupported options and undefined values
        const cleanOptions: any = {};

        if ((options as any).method) cleanOptions.method = (options as any).method;
        if ((options as any).headers) cleanOptions.headers = (options as any).headers;
        if ((options as any).body) cleanOptions.body = (options as any).body;
        if ((options as any).signal) cleanOptions.signal = (options as any).signal;

        return fetch(url, cleanOptions);
      },
    },
  }
);

console.log('✅ Supabase client initialized successfully');
