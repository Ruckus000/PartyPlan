import Constants from 'expo-constants';
import { supabase } from './supabase';
import type { Session } from '@supabase/supabase-js';

const supabaseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export interface AuthResponse {
    session: Session | null;
    error: {
        message: string;
        status?: number;
        code?: string;
    } | null;
}

/**
 * Custom auth service using direct fetch calls to bypass Supabase client issues
 */
export const authService = {
    /**
     * Sign up a new user
     */
    async signUp(email: string, password: string): Promise<AuthResponse> {
        if (!supabaseUrl || !supabaseAnonKey) {
            return {
                session: null,
                error: { message: 'Missing Supabase configuration' },
            };
        }

        try {
            const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseAnonKey,
                    'Authorization': `Bearer ${supabaseAnonKey}`,
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    session: null,
                    error: {
                        message: data.msg || data.error_description || 'Sign up failed',
                        status: response.status,
                        code: data.error_code || data.error,
                    },
                };
            }

            // If we get a session, set it in Supabase client
            if (data.session) {
                const { error: sessionError } = await supabase.auth.setSession({
                    access_token: data.session.access_token,
                    refresh_token: data.session.refresh_token,
                });

                if (sessionError) {
                    return {
                        session: null,
                        error: { message: `Failed to set session: ${sessionError.message}` },
                    };
                }

                return {
                    session: data.session,
                    error: null,
                };
            }

            // Sign up successful but email confirmation required
            return {
                session: null,
                error: null,
            };
        } catch (error: any) {
            return {
                session: null,
                error: {
                    message: error.message || 'Network request failed',
                    status: 0,
                },
            };
        }
    },

    /**
     * Sign in an existing user
     */
    async signIn(email: string, password: string): Promise<AuthResponse> {
        if (!supabaseUrl || !supabaseAnonKey) {
            return {
                session: null,
                error: { message: 'Missing Supabase configuration' },
            };
        }

        try {
            const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseAnonKey,
                    'Authorization': `Bearer ${supabaseAnonKey}`,
                },
                body: JSON.stringify({ email, password }),
            });

            const responseText = await response.text();
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                return {
                    session: null,
                    error: {
                        message: `Invalid JSON response: ${responseText.substring(0, 100)}`,
                        status: response.status,
                    },
                };
            }

            if (!response.ok) {
                return {
                    session: null,
                    error: {
                        message: data.msg || data.error_description || data.error || 'Sign in failed',
                        status: response.status,
                        code: data.error_code || data.error,
                    },
                };
            }

            // Set the session in Supabase client
            if (data.access_token && data.refresh_token) {
                const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                    access_token: data.access_token,
                    refresh_token: data.refresh_token,
                });

                if (sessionError) {
                    return {
                        session: null,
                        error: { message: `Failed to set session: ${sessionError.message}` },
                    };
                }

                return {
                    session: sessionData.session,
                    error: null,
                };
            }

            // Check if response has session object (alternative format)
            if (data.session && data.session.access_token) {
                const { error: sessionError } = await supabase.auth.setSession({
                    access_token: data.session.access_token,
                    refresh_token: data.session.refresh_token,
                });

                if (sessionError) {
                    return {
                        session: null,
                        error: { message: `Failed to set session: ${sessionError.message}` },
                    };
                }

                return {
                    session: data.session,
                    error: null,
                };
            }

            return {
                session: null,
                error: { message: 'Invalid response from server' },
            };
        } catch (error: any) {
            return {
                session: null,
                error: {
                    message: error.message || 'Network request failed',
                    status: 0,
                },
            };
        }
    },
};

