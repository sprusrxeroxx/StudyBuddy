import { StyleSheet, Text, View, Image } from 'react-native'
import Logo from '../assets/studybuddy.webp'

const Home = () => {
  return (
    <View style={styles.container}>
      <View>
        <Image source={Logo} style={[styles.image, { width: 100, height: 100 }]} resizeMode="cover" />
      </View>
      <Text style={styles.title}>Study Buddy</Text>
      <Text style={[styles.shadowedText, { marginTop: 10, marginBottom: 5 }]}>
        Exams
      </Text>
      <Text style={[styles.shadowedText, { marginTop: 1, marginBottom: 5 }]}>
        Practice
      </Text>
    </View>
  )
}

export default Home

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
  shadowedText: {
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  card: {
    backgroundColor: '#c4d5daad',
    borderRadius: 5,
    padding: 10,
    boxShadow: 'rgba(0, 0, 0, 0.37)',
  },
  image: {
    width: 5,
    height: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00000069',
  }
})