import axios from 'axios';
export const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});
export function getErrorMessage(error) {
    if (axios.isAxiosError(error)) {
        const serverError = error.response?.data;
        if (serverError?.error?.message) {
            return serverError.error.message;
        }
        if (error.message) {
            return error.message;
        }
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unexpected error occurred. Please try again.';
}
export function getErrorCode(error) {
    if (axios.isAxiosError(error)) {
        const serverError = error.response?.data;
        return serverError?.error?.code || null;
    }
    return null;
}
