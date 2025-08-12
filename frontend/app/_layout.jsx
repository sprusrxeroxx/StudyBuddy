import { StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';

const RootLayout = () => {
  return (
    <View style={{ flex: 1 }}>
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="exams" options={{ title: 'Exams' }} />
            <Stack.Screen name="practice" options={{ title: 'Practice' }} />
        </Stack>
      <View style={styles.footerContainer}>
        <Text style={styles.footer}>© 2025 Honeycomb Technologies</Text>
      </View>
    </View>
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
