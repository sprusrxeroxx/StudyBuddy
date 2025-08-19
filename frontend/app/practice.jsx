import { StyleSheet, ActivityIndicator, TouchableOpacity, useColorScheme } from 'react-native'
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Colors } from '../constants/Colors';

import ThemedView from '../components/atoms/ThemedView';
import ThemedText from '../components/atoms/ThemedText';

const Practice = () => {
  const params = useLocalSearchParams();
  const { questionId } = params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [question, setQuestion] = useState(null);
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    const fetchQuestionData = async () => {
      try {
        setLoading(true);
        // If we don't have a questionId, redirect back to exams page
        if (!questionId) {
          router.replace('/exams');
          return;
        }

        // Fetch question data
        const response = await fetch(`https://obscure-space-rotary-phone-9v7xg45756hxj57-5000.app.github.dev/api/questions/${questionId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch question data');
        }
        
        const data = await response.json();
        setQuestion(data);
      } catch (err) {
        console.error('Error fetching question:', err);
        setError('Error loading question data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionData();
  }, [questionId, router]);

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.error}>{error}</ThemedText>
      </ThemedView>
    );
  }

  if (!question) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>No question found</ThemedText>
      </ThemedView>
    );
  }
}

export default Practice

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