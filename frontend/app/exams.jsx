import { StyleSheet, useColorScheme, FlatList, ActivityIndicator } from 'react-native'
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

import { Colors } from '../constants/Colors';
import ThemedView from '../components/atoms/ThemedView';
import ThemedText from '../components/atoms/ThemedText';
import ExamCard from '../components/molecules/ExamCard';

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const colorScheme = useColorScheme();
  const router = useRouter();

  // Fetch all exams
  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://obscure-space-rotary-phone-9v7xg45756hxj57-5000.app.github.dev/api/exams/');
      if (!response.ok) {
        throw new Error('Failed to fetch exams');
      }
      const data = await response.json();
      setExams(data);
      setError(null);
    } catch (err) {
      setError('Error loading exams. Please try again.');
      console.error('Error fetching exams:', err);
    } finally {
      setLoading(false);
    }
  };

  // Navigate to the first question/subquestion/subsection of an exam
  const navigateToExam = async (examId) => {
    try {
      // Fetch the full exam with questions, subquestions, and subsections
      const response = await fetch(`https://obscure-space-rotary-phone-9v7xg45756hxj57-5000.app.github.dev/api/exams/${examId}/full`);
      if (!response.ok) {
        throw new Error('Failed to fetch exam details');
      }
      
      const examData = await response.json();
      
      // Check if the exam has questions
      if (examData.questions && examData.questions.length > 0) {
        const firstQuestion = examData.questions[0];
        console.log('First question:', firstQuestion);
        const firstSubquestion = firstQuestion.subquestions && firstQuestion.subquestions.length > 0 ? firstQuestion.subquestions[0] : null;
        
        // Navigate to the first question (you would need to create this screen)
        router.push({
          pathname: '/practice',
          params: { 
            examId,
            questionId: firstQuestion.id,
            // You can add more parameters as needed
          }
        });
      } else {
        alert('This exam has no questions');
      }
    } catch (err) {
      console.error('Error navigating to exam:', err);
      alert('Error loading exam content');
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

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

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Available Exams</ThemedText>
      
      <FlatList
        data={exams}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ExamCard 
            exam={item} 
            onPress={() => navigateToExam(item.id)}
            colorScheme={colorScheme}
          />
        )}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
      />
    </ThemedView>
  )
}

export default Exams

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  error: {
    color: 'red',
    textAlign: 'center',
  }
})