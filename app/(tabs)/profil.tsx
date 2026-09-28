// app/(tabs)/profil.tsx — Profil akun keluarga + logout.
import { router } from 'expo-router';
import { ChevronRight, HelpCircle, LogOut, ShieldCheck, UserCircle } from 'lucide-react-native';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { useAuth } from '@/context/AuthContext';
import { logout } from '@/services/auth';

export default function Profil() {
  const { user } = useAuth();

  const handleLogout = () => {
    Alert.alert('Keluar', 'Yakin ingin keluar dari akun?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <Screen scroll aurora>
      <Text style={styles.title}>Profil</Text>

      <View style={styles.card}>
        <View style={styles.avatar}>
          <UserCircle size={48} color={colors.primaryContainer} strokeWidth={1.5} />
        </View>
        <Text style={styles.username}>{user?.displayName ?? 'Akun Keluarga'}</Text>
        <Text style={styles.role}>Admin Keluarga</Text>
      </View>

      <View style={styles.infoCard}>
        <ShieldCheck size={18} color={colors.green} strokeWidth={2} />
        <Text style={styles.infoText}>
          Akun ini memantau driver keluarga Anda dan mengatur batas kecepatan serta sensitivitas
          deteksi untuk tiap driver.
        </Text>
      </View>

      <Pressable style={styles.menuRow} onPress={() => router.push('/panduan')}>
        <HelpCircle size={18} color={colors.primaryContainer} strokeWidth={2} />
        <Text style={styles.menuText}>Panduan Penggunaan</Text>
        <ChevronRight size={18} color={colors.outline} strokeWidth={2} />
      </Pressable>

      <Button
        label="Keluar"
        variant="danger"
        onPress={handleLogout}
        icon={<LogOut size={18} color={colors.redSoft} strokeWidth={2} />}
        style={styles.logoutBtn}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.headlineLg, color: colors.onSurface, marginBottom: spacing.lg },
  card: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    borderRadius: radius.card,
    padding: spacing.xl,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  username: { ...typography.headlineMd, color: colors.onSurface },
  role: { ...typography.labelSm, color: colors.primaryContainer },
  infoCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    borderRadius: radius.card,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  infoText: { ...typography.bodySm, color: colors.onSurfaceVariant, flex: 1, lineHeight: 20 },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    borderRadius: radius.card,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  menuText: { ...typography.bodyMd, color: colors.onSurface, flex: 1 },
  logoutBtn: {},
});
