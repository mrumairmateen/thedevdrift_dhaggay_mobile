// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  // Tab bar
  'house.fill': 'home',
  'bag.fill': 'shopping-bag',
  'building.2.fill': 'store',
  'cart.fill': 'shopping-cart',
  'person.fill': 'person',
  // Navigation
  'chevron.left': 'chevron-left',
  'chevron.right': 'chevron-right',
  'chevron.left.forwardslash.chevron.right': 'code',
  'xmark': 'close',
  // Actions
  'heart': 'favorite-border',
  'heart.fill': 'favorite',
  'magnifyingglass': 'search',
  'slider.horizontal.3': 'tune',
  'arrow.up.arrow.down': 'swap-vert',
  'square.grid.2x2': 'grid-view',
  'list.bullet': 'view-list',
  'paperplane.fill': 'send',
  'star.fill': 'star',
  'star': 'star-border',
  'checkmark.seal.fill': 'verified',
  'mappin': 'place',
  'tag.fill': 'sell',
  'plus': 'add',
  'minus': 'remove',
  'trash': 'delete',
  // Product detail
  'square.and.arrow.up': 'share',
  'shippingbox.fill': 'local-shipping',
  'scissors': 'content-cut',
  // Notifications
  'bell': 'notifications-none',
  'bell.fill': 'notifications',
  // Home header
  'location.fill': 'place',
  'chevron.down': 'expand-more',
  'bag': 'shopping-bag',
  // Settings / theme
  'gearshape.fill': 'settings',
  'sun.max.fill': 'wb-sunny',
  'moon.stars.fill': 'nightlight-round',
  // Designs tab
  'paintbrush.fill': 'palette',
  // Category row
  'leaf.fill': 'eco',
  'sparkles': 'auto-awesome',
  'wind': 'air',
  'cloud.fill': 'cloud',
  'moon.fill': 'nightlight-round',
  'snowflake': 'ac-unit',
  'square.grid.2x2.fill': 'grid-view',
  // Dashboard tabs
  'chart.bar.fill': 'bar-chart',
  'bookmark.fill': 'bookmark',
  'gift.fill': 'card-giftcard',
  'person.crop.circle': 'account-circle',
  'person': 'person-outline',
  'photo.on.rectangle': 'photo-library',
  'gauge': 'speed',
  // Dashboard components
  'ruler.fill': 'straighten',
  'doc.on.doc.fill': 'content-copy',
  'pencil': 'edit',
  'chevron.up': 'expand-less',
  // Errors / status
  'exclamationmark.triangle': 'warning',
  'exclamationmark.triangle.fill': 'warning',
  'checkmark.circle.fill': 'check-circle',
  'xmark.circle.fill': 'cancel',
  // Order wizard
  'tshirt.fill': 'checkroom',
  'ruler': 'straighten',
  'camera.fill': 'camera-alt',
  // Misc
  'arrow.right': 'arrow-forward',
  'arrow.left': 'arrow-back',
  'info.circle': 'info-outline',
  'info.circle.fill': 'info',
  'clock': 'schedule',
  'clock.fill': 'schedule',
  'calendar': 'calendar-today',
  'phone.fill': 'phone',
  'envelope.fill': 'email',
  'lock.fill': 'lock',
  'eye': 'visibility',
  'eye.slash': 'visibility-off',
  'square.and.pencil': 'edit-note',
  'hand.thumbsup.fill': 'thumb-up',
  'trophy.fill': 'emoji-events',
  'chart.line.uptrend.xyaxis': 'trending-up',
  'rectangle.portrait.and.arrow.right': 'logout',
  'person.crop.circle.fill': 'account-circle',
  // Navigation / hamburger
  'line.3.horizontal': 'menu',
  'sidebar.left': 'menu',
} as IconMapping;

export type { IconSymbolName };

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}): React.JSX.Element {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
