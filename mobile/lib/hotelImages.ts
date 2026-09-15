import type { ImageSourcePropType } from 'react-native';

/** Local hotel photos used by seed covers + galleries. */
const byFile: Record<string, ImageSourcePropType> = {
  'hotel-horse-breakfast.png': require('../assets/hotels/hotel-horse-breakfast.png'),
  'hotel-pony-reception.png': require('../assets/hotels/hotel-pony-reception.png'),
  'hotel-pony-bed.png': require('../assets/hotels/hotel-pony-bed.png'),
  'hotel-horse-bathrobe.png': require('../assets/hotels/hotel-horse-bathrobe.png'),
  'hotel-pony-bellhop.png': require('../assets/hotels/hotel-pony-bellhop.png'),
  'hotel-horse-seaside.png': require('../assets/hotels/hotel-horse-seaside.png'),
  'hotel-pony-suite-door.png': require('../assets/hotels/hotel-pony-suite-door.png'),
  'hotel-horse-oldtown.png': require('../assets/hotels/hotel-horse-oldtown.png'),
  'hotel-pony-inspector.png': require('../assets/hotels/hotel-pony-inspector.png'),
  'hotel-pony-quiet.png': require('../assets/hotels/hotel-pony-quiet.png'),
  'h1-room.png': require('../assets/hotels/h1-room.png'),
  'h1-view.png': require('../assets/hotels/h1-view.png'),
  'h1-bath.png': require('../assets/hotels/h1-bath.png'),
  'h2-room.png': require('../assets/hotels/h2-room.png'),
  'h2-view.png': require('../assets/hotels/h2-view.png'),
  'h2-bath.png': require('../assets/hotels/h2-bath.png'),
  'h3-room.png': require('../assets/hotels/h3-room.png'),
  'h3-view.png': require('../assets/hotels/h3-view.png'),
  'h3-bath.png': require('../assets/hotels/h3-bath.png'),
  'h4-room.png': require('../assets/hotels/h4-room.png'),
  'h4-view.png': require('../assets/hotels/h4-view.png'),
  'h4-bath.png': require('../assets/hotels/h4-bath.png'),
  'h5-room.png': require('../assets/hotels/h5-room.png'),
  'h5-view.png': require('../assets/hotels/h5-view.png'),
  'h5-bath.png': require('../assets/hotels/h5-bath.png'),
  'h6-room.png': require('../assets/hotels/h6-room.png'),
  'h6-view.png': require('../assets/hotels/h6-view.png'),
  'h6-bath.png': require('../assets/hotels/h6-bath.png'),
  'h7-room.png': require('../assets/hotels/h7-room.png'),
  'h7-view.png': require('../assets/hotels/h7-view.png'),
  'h7-bath.png': require('../assets/hotels/h7-bath.png'),
  'h8-room.png': require('../assets/hotels/h8-room.png'),
  'h8-view.png': require('../assets/hotels/h8-view.png'),
  'h8-bath.png': require('../assets/hotels/h8-bath.png'),
  'h9-room.png': require('../assets/hotels/h9-room.png'),
  'h9-view.png': require('../assets/hotels/h9-view.png'),
  'h9-bath.png': require('../assets/hotels/h9-bath.png'),
  'h10-room.png': require('../assets/hotels/h10-room.png'),
  'h10-view.png': require('../assets/hotels/h10-view.png'),
  'h10-bath.png': require('../assets/hotels/h10-bath.png'),
};

export function hotelImageSource(
  imageUrl: string | null | undefined
): ImageSourcePropType | null {
  if (!imageUrl) return null;
  const file = imageUrl.split('/').pop()?.split('?')[0];
  if (file && byFile[file]) return byFile[file];
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return { uri: imageUrl };
  }
  return null;
}

export function hotelGallerySources(urls: string[] | undefined | null): ImageSourcePropType[] {
  if (!urls?.length) return [];
  return urls
    .map((u) => hotelImageSource(u))
    .filter((s): s is ImageSourcePropType => s != null);
}
