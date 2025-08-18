import { Colors } from '../../constants/Colors';
import ThemedText from '../atoms/ThemedText';
import ThemedView from '../atoms/ThemedView';
import { Card } from "@/components/ui/card";

const QuestionCard = ({ question, colorScheme }) => {
    const theme = Colors[colorScheme] ?? Colors.light;
    
    // Check if we have the first subquestion and subsection
    const firstSubquestion = question.sub_questions && question.sub_questions.length > 0 
        ? question.sub_questions[0] 
        : null;
        
    const firstSubsection = firstSubquestion && firstSubquestion.sub_sections && firstSubquestion.sub_sections.length > 0 
        ? firstSubquestion.sub_sections[0] 
        : null;

    return (
        <ThemedView style={[styles.card, { backgroundColor: theme.uiBackground }]}>
        <ThemedText style={styles.questionHeader}>
            Question {question.sort_order}
        </ThemedText>
        
        {/* Display question stem if available */}
        {question.stem && (
            <ThemedText style={styles.questionStem}>{question.stem}</ThemedText>
        )}
        
        {/* Display first subquestion if available */}
        {firstSubquestion && (
            <ThemedView style={styles.subquestionContainer}>
            <ThemedText style={styles.subquestionTitle}>
                {question.sort_order}.{firstSubquestion.sort_order} {firstSubquestion.stem}
            </ThemedText>
            
            {/* Display first subsection if available */}
            {firstSubsection && (
                <ThemedView style={styles.subsectionContainer}>
                <ThemedText style={styles.subsectionText}>
                    {question.sort_order}.{firstSubquestion.sort_order}.{firstSubsection.sort_order} {firstSubsection.stem}
                </ThemedText>
                </ThemedView>
            )}
            </ThemedView>
        )}
        </ThemedView>
    );
};

const styles = {
    card: {
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
  },
    questionHeader: {
        fontWeight: 'bold',
        fontSize: 22,
        marginBottom: 12,
  },
    questionStem: {
        fontSize: 16,
        marginBottom: 16,
  },
    subquestionContainer: {
        marginTop: 8,
        marginBottom: 8,
  },
    subquestionTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 8,
  },
    subsectionContainer: {
        marginLeft: 16,
        marginTop: 8,
  },
    subsectionText: {
        fontSize: 16,
  },
}

export default QuestionCard