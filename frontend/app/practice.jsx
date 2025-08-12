import { StyleSheet, Text, View } from 'react-native'
import { Link } from 'expo-router'

const Practice = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Practice Page</Text>
    </View>
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