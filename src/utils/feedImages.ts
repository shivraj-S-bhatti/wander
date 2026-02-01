/**
 * Map checkin id to activity image from src/assets/feed.
 * Attach the correct image to each activity in the community feed.
 */
const FEED_IMAGES: Record<string, number> = {
  c_1: require('../assets/feed/latte_with_friends.png'),
  c_2: require('../assets/feed/grill.jpeg'),
  c_3: require('../assets/feed/sunset_marina.jpg'),
  c_4: require('../assets/feed/cookings_with_friends.jpeg'),
  c_5: require('../assets/feed/cookings_with_friends.jpeg'),
  c_6: require('../assets/feed/cleanup_with_friends.jpeg'),
};

export function getFeedImage(checkinId: string): number | undefined {
  return FEED_IMAGES[checkinId];
}
