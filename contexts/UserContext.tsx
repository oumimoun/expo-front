import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { auth } from '../services/auth';

export interface User {
    login: string;
    email: string;
    avatar: string;
    fname: string;
    lname: string;
    role: string;
    admin: boolean;
    register: number;
    attendance: number;
    iat?: number;
    exp?: number;
}

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    isAdmin: boolean;
    loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeUser = async () => {
            try {
                const currentUser = await auth.getCurrentUser();
                console.log('Initializing user:', currentUser);
                setUser(currentUser);
            } catch (error) {
                console.error('Error initializing user:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeUser();
    }, []);

    const value = {
        user,
        setUser,
        isAdmin: user?.admin || false,
        loading,
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
} 