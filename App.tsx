import { NotificationProvider } from './contexts/NotificationContext';

export default function App() {
    return (
        <ThemeProvider>
            <UserProvider>
                <NotificationProvider>
                    {/* Rest of your app components */}
                </NotificationProvider>
            </UserProvider>
        </ThemeProvider>
    );
} 