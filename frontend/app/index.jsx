import { StyleSheet, Image, useColorScheme } from 'react-native'
import { Link } from 'expo-router'

import Logo from '../assets/studybuddy.webp'
import Spacer from '../components/atoms/Spacer'
import ThemedView from '../components/atoms/ThemedView';
import ThemedText from '../components/atoms/ThemedText'

const Home = () => {
  return (
    <ThemedView style={styles.container} >
      <ThemedView>
        <Image source={Logo} style={[styles.image, { width: 100, height: 100 }]} resizeMode="cover" />
      </ThemedView>
      <ThemedText title={true} ><Link href="/">Study Buddy</Link></ThemedText>
      <Spacer />
      <ThemedText style={styles.shadowedText}><Link href="/exams">Exams</Link></ThemedText>
      <ThemedText style={[styles.shadowedText, { marginTop: 1 }]}>
        <Link href="/practice">Practice</Link>
      </ThemedText>
    </ThemedView>
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
    textShadowColor: 'rgba(0, 0, 0, 0.19)',
    textShadowOffset: { width: 2, height: 3 },
    textShadowRadius: 5,
    marginBottom: 5
  },
  card: {
    backgroundColor: '#c4d5daad',
    borderRadius: 5,
    padding: 10,
    boxShadow: 'rgba(0, 0, 0, 0.23)',
  },
  image: {
    width: 5,
    height: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00000069',
  }
})