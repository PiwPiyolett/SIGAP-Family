// app/(auth)/register.tsx — Daftar akun keluarga (SIPERKASA Family).
import { router } from 'expo-router';
import { Lock, User, Users } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { authErrorMessage, registerUser } from '@/services/auth';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');
    if (!username.trim() || !password) {
      setError('Username dan password wajib diisi.');
      return;
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }
    if (password !== confirm) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }
    setLoading(true);
    try {
      await registerUser(username, password);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(authErrorMessage(e?.code ?? ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll padded={false} avoidKeyboard aurora>
      <Animated.View entering={FadeIn.duration(700)} style={styles.header}>
        <View style={styles.logoRing}>
          <Users size={48} color={colors.primaryContainer} strokeWidth={1.5} />
        </View>
        <Text style={styles.brand}>Buat Akun Keluarga</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(150)} style={styles.card}>
        <Text style={styles.title}>Daftar</Text>

        <Input
          label="Username"
          icon={User}
          placeholder="Pilih username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <Input
          label="Password"
          icon={Lock}
          placeholder="Minimal 6 karakter"
          value={password}
          onChangeText={setPassword}
          password
        />
        <Input
          label="Konfirmasi Password"
          icon={Lock}
          placeholder="Ulangi password"
          value={confirm}
          onChangeText={setConfirm}
          password
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button label="Daftar" onPress={handleRegister} loading={loading} style={styles.submit} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Sudah punya akun? </Text>
          <Text style={styles.link} onPress={() => router.replace('/login')}>
            Masuk di sini
          </Text>
        </View>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xl },
  logoRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.primaryContainer,
    shadowColor: colors.primaryContainer,
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
    marginBottom: spacing.sm,
  },
  brand: { ...typography.headlineMd, color: colors.onSurface },
  card: {
    backgroundColor: colors.surfaceContainer,
    borderTopWidth: 2,
    borderTopColor: colors.primaryContainer,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.md,
    minHeight: 420,
  },
  title: { ...typography.headlineMd, color: colors.onSurface, marginBottom: spacing.xs },
  error: { ...typography.bodySm, color: colors.redSoft },
  submit: { marginTop: spacing.sm },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.sm },
  footerText: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  link: { ...typography.bodyMd, color: colors.primaryContainer },
});
