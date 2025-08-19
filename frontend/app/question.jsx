import { StyleSheet, ActivityIndicator, TouchableOpacity, useColorScheme, ScrollView } from 'react-native'
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Colors } from '../constants/Colors';

import ThemedView from '../components/atoms/ThemedView';
import ThemedText from '../components/atoms/ThemedText';
import SolutionChecker from '../components/molecules/SolutionChecker';

const Question = () => {
  const params = useLocalSearchParams();
  const { questionId } = params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [question, setQuestion] = useState(null);
  const [currentSubQuestionIndex, setCurrentSubQuestionIndex] = useState(0);
  const [currentSubSectionIndex, setCurrentSubSectionIndex] = useState(0);
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    const fetchQuestionData = async () => {
      try {
        setLoading(true);
        if (!questionId) {
          router.replace('/exams');
          return;
        }
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

  // Get current subquestion and subsection
  const currentSubQuestion = question?.sub_questions?.[currentSubQuestionIndex] || null;
  const hasSubSections = currentSubQuestion?.sub_sections && currentSubQuestion.sub_sections.length > 0;
  
  // Determine if we should show the subquestion or its subsections
  const showSubQuestionDirectly = currentSubQuestion?.solutions && (!hasSubSections || currentSubQuestion.sub_sections.length === 0);
  const currentSubSection = hasSubSections ? currentSubQuestion.sub_sections[currentSubSectionIndex] : null;

  // Handle moving to next item
  const moveToNext = () => {
    if (showSubQuestionDirectly) {
      // Move to next subquestion
      if (currentSubQuestionIndex < question.sub_questions.length - 1) {
        setCurrentSubQuestionIndex(currentSubQuestionIndex + 1);
        setCurrentSubSectionIndex(0);
      } else {
        alert('Congratulations! You completed all questions.');
      }
    } else if (hasSubSections) {
      // Move to next subsection or next subquestion
      if (currentSubSectionIndex < currentSubQuestion.sub_sections.length - 1) {
        setCurrentSubSectionIndex(currentSubSectionIndex + 1);
      } else if (currentSubQuestionIndex < question.sub_questions.length - 1) {
        setCurrentSubQuestionIndex(currentSubQuestionIndex + 1);
        setCurrentSubSectionIndex(0);
      } else {
        alert('Congratulations! You completed all questions.');
      }
    }
  };

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

  // Calculate progress text
  let progressText = `Question ${currentSubQuestionIndex + 1} of ${question.sub_questions.length}`;
  if (hasSubSections && !showSubQuestionDirectly) {
    progressText += ` • Part ${currentSubSectionIndex + 1} of ${currentSubQuestion.sub_sections.length}`;
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header with progress indicator */}
      <ThemedView style={styles.header}>
        <ThemedText style={styles.progressText}>{progressText}</ThemedText>
      </ThemedView>

      {/* Content area with question text */}
      <ScrollView style={styles.content}>
        {/* Main question stem */}
        {question.stem && (
          <ThemedText style={styles.questionStem}>{question.stem}</ThemedText>
        )}

        {/* Current item content */}
        <ThemedView style={styles.currentItem}>
          {showSubQuestionDirectly ? (
            <>
              <ThemedText style={styles.itemTitle}>
                {question.sort_order}.{currentSubQuestion.sort_order}
              </ThemedText>
              <ThemedText style={styles.itemContent}>
                {currentSubQuestion.stem}
              </ThemedText>
              
              {/* Solution checker for subquestion */}
              {currentSubQuestion.solutions && (
                <SolutionChecker
                  solution={currentSubQuestion.solutions}
                  onCorrectAnswer={moveToNext}
                  colorScheme={colorScheme}
                />
              )}
            </>
          ) : (
            <>
              <ThemedText style={styles.itemTitle}>
                {question.sort_order}.{currentSubQuestion.sort_order}.{currentSubSection.sort_order}
              </ThemedText>
              <ThemedText style={styles.itemContent}>
                {currentSubSection.stem}
              </ThemedText>
              
              {/* Solution checker for subsection */}
              {currentSubSection.solutions && (
                <SolutionChecker
                  solution={currentSubSection.solutions}
                  onCorrectAnswer={moveToNext}
                  colorScheme={colorScheme}
                />
              )}
            </>
          )}
        </ThemedView>
      </ScrollView>

      {/* Navigation buttons */}
      <ThemedView style={styles.navigation}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => router.back()}
        >
          <ThemedText style={styles.navButtonText}>Back to Exams</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

export default Question;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  questionStem: {
    fontSize: 18,
    marginBottom: 24,
    lineHeight: 24,
    color: '#333',
  },
  currentItem: {
    marginBottom: 32,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2c3e50',
  },
  itemContent: {
    fontSize: 16,
    lineHeight: 22,
    color: '#34495e',
    marginBottom: 16,
  },
  navigation: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  navButton: {
    padding: 12,
    backgroundColor: '#3498db',
    borderRadius: 6,
    alignItems: 'center',
  },
  navButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  error: {
    color: 'red',
    marginBottom: 16,
  }
});