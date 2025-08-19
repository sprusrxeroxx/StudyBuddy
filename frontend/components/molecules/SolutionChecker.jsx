// frontend/components/molecules/SolutionChecker.jsx
import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import ThemedText from '../atoms/ThemedText';
import { Colors } from '../../constants/Colors';

const SolutionChecker = ({ solution, onCorrectAnswer, colorScheme }) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  
  const theme = Colors[colorScheme] ?? Colors.light;
  
  const checkAnswer = () => {
    if (!userAnswer.trim()) return;
    
    // Simple case-insensitive comparison
    const isCorrect = userAnswer.trim().toLowerCase() === solution?.trim().toLowerCase();
    setFeedback(isCorrect);
    setIsChecked(true);
    
    // If correct, trigger the callback to move to next question
    if (isCorrect && onCorrectAnswer) {
      setTimeout(() => {
        onCorrectAnswer();
      }, 1000); // Short delay so user sees the success message
    }
  };
  
  const resetAnswer = () => {
    setUserAnswer('');
    setFeedback(null);
    setIsChecked(false);
  };

  // If there's no solution, don't render the component
  // if (!solution) return null;

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input, 
          { 
            color: theme.text,
            backgroundColor: theme === Colors.dark ? '#2A2A3A' : '#F0F0F0',
            borderColor: feedback === true ? '#4CAF50' : 
                        feedback === false ? Colors.warning : 
                        theme === Colors.dark ? '#4A4A5A' : '#DDD'
          }
        ]}
        placeholder="Enter your answer"
        placeholderTextColor={theme === Colors.dark ? '#AAAAAA' : '#999999'}
        value={userAnswer}
        onChangeText={setUserAnswer}
        editable={!isChecked}
      />
      
      <View style={styles.buttonContainer}>
        {!isChecked ? (
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: Colors.primary }]} 
            onPress={checkAnswer}
          >
            <ThemedText style={styles.buttonText}>Check Answer</ThemedText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme === Colors.dark ? '#444' : '#DDD' }]} 
            onPress={resetAnswer}
          >
            <ThemedText style={styles.buttonText}>Try Again</ThemedText>
          </TouchableOpacity>
        )}
      </View>
      
      {isChecked && (
        <View style={styles.feedbackContainer}>
          <ThemedText 
            style={[
              styles.feedback, 
              { color: feedback ? '#4CAF50' : Colors.warning }
            ]}
          >
            {feedback ? 'Correct! ✓' : 'Incorrect. Try again.'}
          </ThemedText>
          {!feedback && solution && (
            <ThemedText style={styles.solutionText}>
              Solution: {solution}
            </ThemedText>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: '500',
  },
  feedbackContainer: {
    marginTop: 8,
  },
  feedback: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  solutionText: {
    marginTop: 4,
    fontStyle: 'italic',
  }
});

export default SolutionChecker;