// src/service/apiClient.ts

import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}

const createAxiosInstance = (): AxiosInstance => {
    const instance = axios.create({
        baseURL: API_BASE_URL,
        timeout: 45000,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    instance.interceptors.request.use(
        (config) => {
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    instance.interceptors.response.use(
        (response) => response,
        (error: AxiosError) => {
            if (error.response?.status === 401) {
                console.error("Unauthorized access - 401. Clearing token.");
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                }
            }
            return Promise.reject(error);
        }
    );

    return instance;
};

const apiClient = createAxiosInstance();

export default apiClient;