import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';

export default function BookingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Мои брони</Text>
      <Text style={styles.hint}>Пока пусто, как конюшня без сена.</Text>
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
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 10,
  },
  hint: {
    fontSize: 15,
    textAlign: 'center',
    opacity: 0.65,
  },
});
