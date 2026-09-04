import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';

export default function SearchScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>HoofHotel</Text>
      <Text style={styles.slogan}>Найди ночлег. Без лишней скачки.</Text>
      <Text style={styles.hint}>Введите город, чтобы найти отель.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  slogan: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.85,
    marginBottom: 20,
  },
  hint: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.6,
    lineHeight: 20,
  },
});
