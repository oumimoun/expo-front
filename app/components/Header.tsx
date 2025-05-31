import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function Header() {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    return <View style={styles.header} />;
}

const makeStyles = (theme: any) => StyleSheet.create({
    header: {
        height: 20,
        backgroundColor: theme.surface,
    },
}); 