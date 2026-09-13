import type { ImageSourcePropType } from 'react-native';

/** Local comic photos — у кожного готелю свій набір, без повторів між готелями. */
const byFile: Record<string, ImageSourcePropType> = {
  'hotel-horse-breakfast.png': require('../assets/hotels/hotel-horse-breakfast.png'),
  'hotel-pony-reception.png': require('../assets/hotels/hotel-pony-reception.png'),
  'hotel-pony-bed.png': require('../assets/hotels/hotel-pony-bed.png'),
  'hotel-horse-bathrobe.png': require('../assets/hotels/hotel-horse-bathrobe.png'),
  'hotel-pony-bellhop.png': require('../assets/hotels/hotel-pony-bellhop.png'),
  'hotel-horse-minibar.png': require('../assets/hotels/hotel-horse-minibar.png'),
  'hotel-ponies-balcony.png': require('../assets/hotels/hotel-ponies-balcony.png'),
  'hotel-horse-seaside.png': require('../assets/hotels/hotel-horse-seaside.png'),
  'hotel-pony-suite-door.png': require('../assets/hotels/hotel-pony-suite-door.png'),
  'hotel-horse-oldtown.png': require('../assets/hotels/hotel-horse-oldtown.png'),
  'hotel-pony-inspector.png': require('../assets/hotels/hotel-pony-inspector.png'),
  'hotel-pony-quiet.png': require('../assets/hotels/hotel-pony-quiet.png'),
  'h1-keys.png': require('../assets/hotels/h1-keys.png'),
  'h1-suite.png': require('../assets/hotels/h1-suite.png'),
  'h2-bounce.png': require('../assets/hotels/h2-bounce.png'),
  'h2-coffee.png': require('../assets/hotels/h2-coffee.png'),
  'h3-beach.png': require('../assets/hotels/h3-beach.png'),
  'h3-rooftop.png': require('../assets/hotels/h3-rooftop.png'),
  'h4-lucky.png': require('../assets/hotels/h4-lucky.png'),
  'h4-bath.png': require('../assets/hotels/h4-bath.png'),
  'h5-spa.png': require('../assets/hotels/h5-spa.png'),
  'h5-river.png': require('../assets/hotels/h5-river.png'),
  'h6-luggage.png': require('../assets/hotels/h6-luggage.png'),
  'h6-saddle.png': require('../assets/hotels/h6-saddle.png'),
  'h7-taxi.png': require('../assets/hotels/h7-taxi.png'),
  'h7-map.png': require('../assets/hotels/h7-map.png'),
  'h8-buffet.png': require('../assets/hotels/h8-buffet.png'),
  'h8-straw.png': require('../assets/hotels/h8-straw.png'),
  'h9-sheets.png': require('../assets/hotels/h9-sheets.png'),
  'h9-nap.png': require('../assets/hotels/h9-nap.png'),
  'h10-bunk.png': require('../assets/hotels/h10-bunk.png'),
  'h10-kitchen.png': require('../assets/hotels/h10-kitchen.png'),
  'room-cozy.png': require('../assets/hotels/room-cozy.png'),
  'room-suite.png': require('../assets/hotels/room-suite.png'),
  'room-bunk.png': require('../assets/hotels/room-bunk.png'),
  'view-city.png': require('../assets/hotels/view-city.png'),
  'view-sea.png': require('../assets/hotels/view-sea.png'),
  'view-square.png': require('../assets/hotels/view-square.png'),
  'bath-shower.png': require('../assets/hotels/bath-shower.png'),
  'bath-tub.png': require('../assets/hotels/bath-tub.png'),
  'bath-jacuzzi.png': require('../assets/hotels/bath-jacuzzi.png'),
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
