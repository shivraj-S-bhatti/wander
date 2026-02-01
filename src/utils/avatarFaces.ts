/**
 * Face assets from src/assets/faces. Keys match avatar strings in demo data.
 * Use getFaceSource(avatar) for Image source; null = use fallback (e.g. initial).
 */
const FACE_ASSETS: Record<string, number> = {
  guy1: require('../assets/faces/guy1.jpg'),
  guy2: require('../assets/faces/guy2.jpg'),
  guy3: require('../assets/faces/guy3.jpg'),
  guy4: require('../assets/faces/guy4.jpg'),
  gal1: require('../assets/faces/gal1.jpg'),
  gal2: require('../assets/faces/gal2.jpg'),
  gal3: require('../assets/faces/gal3.jpg'),
};

export const FACE_KEYS = Object.keys(FACE_ASSETS);

export function getFaceSource(faceKey: string | undefined): number | { uri: string } | null {
  if (!faceKey) return null;
  const asset = FACE_ASSETS[faceKey];
  if (asset != null) return asset;
  if (faceKey.startsWith('http://') || faceKey.startsWith('https://')) return { uri: faceKey };
  return null;
}
