import { StyleSheet, ActivityIndicator, TouchableOpacity, useColorScheme } from 'react-native'
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Colors } from '../constants/Colors';

import ThemedView from '../components/atoms/ThemedView';
import ThemedText from '../components/atoms/ThemedText';

const Admin = () => {

}

export default Admin

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
  },
  error: {
    color: 'red',
    marginBottom: 16,
  }
})