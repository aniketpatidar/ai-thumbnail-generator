/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

const DEMO_USERNAME = process.env.DEMO_USERNAME;
const DEMO_PASSWORD = process.env.DEMO_PASSWORD;
const AUTH_TOKEN_KEY = 'auth_token';

/**
 * Attempts to log in a user with provided credentials.
 * @param username The username to check.
 * @param password The password to check.
 * @returns True if credentials are valid, false otherwise.
 */
export function login(username: string, password: string): boolean {
    // Check if demo credentials are configured
    if (!DEMO_USERNAME || !DEMO_PASSWORD) {
        console.error('Demo credentials not configured in environment variables');
        return false;
    }

    if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
        localStorage.setItem(AUTH_TOKEN_KEY, 'authenticated'); // Store a simple token
        return true;
    }
    return false;
}

/**
 * Checks if a user is currently authenticated.
 * @returns True if authenticated, false otherwise.
 */
export function isAuthenticated(): boolean {
    return localStorage.getItem(AUTH_TOKEN_KEY) === 'authenticated';
}

/**
 * Logs out the current user.
 */
export function logout(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
}

/**
 * This application does not support user registration.
 * This function is a placeholder to explicitly state that.
 */
export function register(): never {
    throw new Error("User registration is not supported in this demo application.");
}
