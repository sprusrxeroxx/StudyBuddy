import { StyleSheet, Text, View } from 'react-native'
import ThemedView from '../components/ThemedView';
import ThemedText from '../components/ThemedText';

const Practice = () => {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Practice Page</ThemedText>
    </ThemedView>
  )
}

export default Practice

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 24,
  },
})