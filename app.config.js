// Load API keys from .env (see .env.example). Never commit .env.
export default ({ config }) => {
  const googleKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY || '';
  const geminiKey = process.env.EXPO_PUBLIC_GEMINI_KEY || '';
  return {
    ...config,
    extra: { googleMapsKey: googleKey, geminiKey },
    ios: {
      ...config.ios,
      ...(googleKey && {
        config: { ...(config.ios?.config || {}), googleMapsApiKey: googleKey },
      }),
    },
  };
};
