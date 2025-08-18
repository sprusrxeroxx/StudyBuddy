import {  TouchableOpacity } from 'react-native'

import { Colors } from '../../constants/Colors';
import ThemedText from '../atoms/ThemedText';

const ExamCard = ({ exam, onPress, colorScheme }) => {
  const theme = Colors[colorScheme] ?? Colors.light;
  
  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: theme.uiBackground }]} 
      onPress={onPress}
    >
      <ThemedText style={styles.subject}>{exam.subject}</ThemedText>
      <ThemedText style={styles.cardInfo}>{exam.year}</ThemedText>
      {exam.month && <ThemedText style={styles.cardInfo}>{exam.month}</ThemedText>}
      {exam.province && <ThemedText style={styles.cardInfo}>{exam.province}</ThemedText>}
    </TouchableOpacity>
  );
};

const styles = {
    card: {
    flex: 1,
    margin: 8,
    padding: 16,
    borderRadius: 8,
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  subject: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
  cardInfo: {
    fontSize: 14,
    marginBottom: 4,
  },
}
export default ExamCard;