import formatcoords from 'formatcoords';

export function formatCoordinate({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}): string {
  return formatcoords(latitude, longitude).format('FFf', { decimalPlaces: 1 });
}
