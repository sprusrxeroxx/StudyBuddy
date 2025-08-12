import { StyleSheet, Text, View } from 'react-native'
import { Link } from 'expo-router'

const Exams = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exams Page</Text>
      <Link href="/" style={styles.link}>Home</Link>
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
  },
  link: {
    marginVertical: 10,
    borderBottomWidth: 1,
  }
})