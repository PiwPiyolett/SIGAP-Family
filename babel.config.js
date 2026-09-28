module.exports = function (api) {
  api.cache(true);
  return {
    // SDK 54: babel-preset-expo sudah menambahkan plugin reanimated/worklets
    // secara otomatis. JANGAN tambahkan 'react-native-worklets/plugin' manual —
    // jika dobel, worklets diproses 2x dan memicu re-render berulang
    // (gejala: TextInput kehilangan fokus & keyboard menutup sendiri).
    presets: ['babel-preset-expo'],
  };
};
