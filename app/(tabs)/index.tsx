// app/(tabs)/index.tsx — Dashboard keluarga: grup, kode undangan, daftar driver.
import { router, useFocusEffect } from 'expo-router';
import { ChevronRight, KeyRound, UserPlus, Users } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { useAuth } from '@/context/AuthContext';
import {
  addDriverByUsername,
  ensureFamily,
  listMembers,
  type Family,
  type FamilyMember,
} from '@/services/family';

export default function Dashboard() {
  const { user } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDriver, setNewDriver] = useState('');
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const fam = await ensureFamily(user.uid, `Keluarga ${user.displayName ?? ''}`.trim());
      setFamily(fam);
      setMembers(await listMembers(fam.id));
    } catch {
      Alert.alert('Gagal memuat', 'Periksa koneksi internet lalu coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        if (active) await load();
      })();
      return () => {
        active = false;
      };
    }, [load]),
  );

  const handleAdd = async () => {
    if (!family || !newDriver.trim()) return;
    setAdding(true);
    try {
      const res = await addDriverByUsername(family.id, newDriver);
      if (!res.ok) {
        Alert.alert('Tidak ditemukan', res.reason ?? 'Driver tidak ditemukan.');
      } else {
        setNewDriver('');
        setMembers(await listMembers(family.id));
      }
    } catch {
      Alert.alert('Gagal', 'Tidak bisa menambahkan driver. Coba lagi.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <Screen scroll aurora>
      <Text style={styles.title}>Keluarga Saya</Text>

      {loading ? (
        <ActivityIndicator color={colors.primaryContainer} style={{ marginTop: spacing.xxl }} />
      ) : (
        <>
          {/* Kartu grup + kode undangan */}
          <View style={styles.familyCard}>
            <View style={styles.familyHead}>
              <Users size={18} color={colors.primaryContainer} strokeWidth={2} />
              <Text style={styles.familyName}>{family?.familyName ?? 'Keluarga Saya'}</Text>
            </View>
            <View style={styles.codeRow}>
              <KeyRound size={14} color={colors.onSurfaceVariant} strokeWidth={2} />
              <Text style={styles.codeLabel}>Kode Undangan</Text>
              <Text style={styles.codeValue}>{family?.inviteCode ?? '—'}</Text>
            </View>
            <Text style={styles.codeHint}>
              Bagikan kode ini, atau tambahkan driver langsung dengan username di bawah.
            </Text>
          </View>

          {/* Tambah driver */}
          <View style={styles.addCard}>
            <Text style={styles.addTitle}>Tambah Driver</Text>
            <Input
              icon={UserPlus}
              placeholder="Username driver (akun SIPERKASA Siswa)"
              value={newDriver}
              onChangeText={setNewDriver}
              autoCapitalize="none"
            />
            <Button label="Tambahkan" onPress={handleAdd} loading={adding} />
          </View>

          {/* Daftar driver */}
          <Text style={styles.sectionTitle}>Driver Terpantau ({members.length})</Text>
          {members.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Belum ada driver.</Text>
              <Text style={styles.emptySub}>Tambahkan driver dengan username mereka di atas.</Text>
            </View>
          ) : (
            members.map((m, i) => (
              <Animated.View key={m.driverUid} entering={FadeInDown.duration(350).delay(Math.min(i, 8) * 60)}>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/driver/[uid]',
                      params: { uid: m.driverUid, username: m.username, familyId: family!.id },
                    })
                  }
                  style={({ pressed }) => [styles.driverCard, { opacity: pressed ? 0.7 : 1 }]}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {m.username.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.driverName}>{m.username}</Text>
                    <Text style={styles.driverMeta}>Ketuk untuk lihat trip & atur batas</Text>
                  </View>
                  <ChevronRight size={20} color={colors.outline} strokeWidth={2} />
                </Pressable>
              </Animated.View>
            ))
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.headlineLg, color: colors.onSurface, marginBottom: spacing.lg },
  familyCard: {
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    borderRadius: radius.card,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  familyHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  familyName: { ...typography.headlineSm, fontSize: 18, color: colors.onSurface },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  codeLabel: { ...typography.labelSm, color: colors.onSurfaceVariant, flex: 1 },
  codeValue: {
    ...typography.dataLg,
    color: colors.primaryContainer,
    letterSpacing: 3,
    fontFamily: 'JetBrainsMono_700Bold',
  },
  codeHint: { ...typography.bodySm, color: colors.outline },
  addCard: {
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    borderRadius: radius.card,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  addTitle: { ...typography.labelMd, color: colors.onSurfaceVariant },
  sectionTitle: { ...typography.headlineSm, fontSize: 16, color: colors.onSurface, marginBottom: spacing.sm },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    borderRadius: radius.card,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.headlineSm, fontSize: 18, color: colors.primaryContainer },
  driverName: { ...typography.headlineSm, fontSize: 16, color: colors.onSurface },
  driverMeta: { ...typography.bodySm, color: colors.onSurfaceVariant },
  empty: { alignItems: 'center', marginTop: spacing.xl, gap: spacing.xs },
  emptyText: { ...typography.bodyLg, color: colors.onSurfaceVariant },
  emptySub: { ...typography.bodySm, color: colors.outline, textAlign: 'center' },
});
