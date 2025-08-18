import { StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { Stack } from 'expo-router';

import ThemedView from '../components/atoms/ThemedView';
import ThemedText from '../components/atoms/ThemedText';

import { Colors } from '../constants/Colors';

const RootLayout = () => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light 

    return (
        <>
            <StatusBar value="auto" />
            <ThemedView style={{ flex: 1 }}>
                <Stack screenOptions = {{
                  headerStyle: { backgroundColor: theme.navbackground },
                  headerTintColor: theme.text
                }}>
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    <Stack.Screen name="exams" options={{ title: 'Exams' }} />
                    <Stack.Screen name="practice" options={{ title: 'Practice' }} />
                </Stack>
            <ThemedView style={styles.footerContainer}>
                <ThemedText style={styles.footer}>© 2025 Honeycomb Technologies</ThemedText>
            </ThemedView>
            </ThemedView>
            );
        </>
    );
};

export default RootLayout;

const styles = StyleSheet.create({
  footerContainer: {
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },
  footer: {
    fontSize: 12,
    color: '#555',
  },
});
