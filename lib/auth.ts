




const DEMO_USERNAME = process.env.DEMO_USERNAME;
const DEMO_PASSWORD = process.env.DEMO_PASSWORD;
const AUTH_TOKEN_KEY = 'auth_token';







export function login(username: string, password: string): boolean {
    
    if (!DEMO_USERNAME || !DEMO_PASSWORD) {
        console.error('Demo credentials not configured in environment variables');
        return false;
    }

    if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
        localStorage.setItem(AUTH_TOKEN_KEY, 'authenticated'); 
        return true;
    }
    return false;
}





export function isAuthenticated(): boolean {
    return localStorage.getItem(AUTH_TOKEN_KEY) === 'authenticated';
}




export function logout(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
}





export function register(): never {
    throw new Error("User registration is not supported in this demo application.");
}
