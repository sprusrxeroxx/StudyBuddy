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
            <StatusBar value="auto" barStyle={colorScheme === 'light' ? 'dark-content' : 'light-content'} />
            <ThemedView style={{ flex: 1 }}>
                <Stack screenOptions = {{
                  headerStyle: { backgroundColor: theme.navbackground },
                  headerTintColor: theme.text
                }}>
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    <Stack.Screen name="exams" options={{ title: '' }} />
                    <Stack.Screen name="practice" options={{ title: '' }} />
                    <Stack.Screen name="question" options={{ title: '' }} />
                </Stack>
            <ThemedView style={[styles.footerContainer, { backgroundColor: theme.uibackground }]}>
                <ThemedText style={[styles.footer, { color: theme.text }]}>© 2025 Honeycomb Technologies</ThemedText>
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
  },
  footer: {
    fontSize: 10,
  },
});
