import { StyleSheet, Text, View } from 'react-native'

const Exams = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exams Page</Text>
    </View>
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