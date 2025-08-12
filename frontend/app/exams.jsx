import { StyleSheet, Text, View, useColorScheme } from 'react-native'
import ThemedView from '../components/ThemedView';
import ThemedText from '../components/ThemedText';

const Exams = () => {

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Exams Page</ThemedText>
    </ThemedView>
  )
}

export default Exams

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 24,
  }
})