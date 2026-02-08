import api from './api';
import { LoginResponse, User } from '../types';

export const authService = {
    login: async (username: string, password: string): Promise<LoginResponse> => {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        // FastAPI OAuth2PasswordRequestForm expects form-urlencoded
        const response = await api.post<LoginResponse>('/login/access-token', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        return response.data;
    },

    getCurrentUser: async (): Promise<User> => {
        const response = await api.get<User>('/users/me');
        return response.data;
    }
};
