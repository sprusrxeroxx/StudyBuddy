import { StatusBar, StyleSheet, Text, useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { Colors } from '../constants/Colors';
import ThemedView from '../components/ThemedView';

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
                <Text style={styles.footer}>© 2025 Honeycomb Technologies</Text>
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
