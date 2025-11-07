/**
 * Utility functions for mapping artist names to image paths
 *
 * Image files are stored in assets/images/artist-profiles/
 * and are named in UPPERCASE with spaces (e.g., "CHRIS LAKE.jpg")
 */

/**
 * Normalize artist name to match image filename format
 * - Convert to uppercase
 * - Remove parenthetical content (e.g., "(Sunset DJ Set)")
 * - Trim whitespace
 */
function normalizeArtistName(artistName: string): string {
  return artistName
    .replace(/\s*\([^)]*\)/g, '') // Remove parentheses and their content
    .trim()
    .toUpperCase();
}

/**
 * Get the require path for an artist's profile image
 * Returns null if no image mapping exists
 */
export function getArtistImagePath(artistName: string): any | null {
  const normalized = normalizeArtistName(artistName);

  // Map of artist names to their image file extensions
  // This could be dynamically generated, but for React Native we need static requires
  const artistImageMap: Record<string, string> = {
    'EDGAR V': 'jpg',
    'JADEN BOJSEN': 'jpg',
    'LAVERN': 'jpg',
    'ARGY': 'jpeg',
    'PORTER ROBINSON': 'jpg',
    'GRYFFIN': 'jpg',
    'SARA LANDRY': 'jpg',
    'CHRIS LAKE': 'jpg',
    'ARMIN VAN BUUREN': 'jpg',
    'DJ CIRCLE K': 'jpg',
    'CANABLISS': 'jpg',
    'SOLA': 'jpg',
    'GORILLAT': 'jpg',
    'SUB FOCUS': 'jpg',
    'RUDIMENTAL': 'jpg',
    'VIRTUAL RIOT': 'jpg',
    'TAPE B': 'jpg',
    'WOOLI': 'jpg',
    'VOYD': 'jpg',
    'CARLOS MENDOZA': 'jpeg',
    'KASIA': 'jpg',
    'BART SKILS': 'jpeg',
    'MISS MONIQUE': 'jpg',
    'KEVIN DE VRIES': 'jpg',
    'ADAM BEYER': 'webp',
    'LAYTON GIORDANI': 'jpg',
    'TIFFY VERA': 'jpg',
    'SLUGG': 'jpg',
    'MORGAN SEATREE': 'jpg',
    'LUUK VAN DIJK': 'jpg',
    'LUKE DEAN': 'jpg',
    'RANGER TRUCCO': 'jpg',
    'RIORDAN': 'jpg',
    'AYYBO': 'jpg',
    'PROSPA': 'jpg',
    'KETTAMA': 'jpg',
    'GORGON CITY': 'jpg',
  };

  const extension = artistImageMap[normalized];
  if (!extension) {
    return null;
  }

  // Return the require path for the image
  // React Native requires static paths at build time
  try {
    return require(`../../assets/images/artist-profiles/${normalized}.${extension}`);
  } catch (error) {
    console.warn(`Image not found for artist: ${normalized}`);
    return null;
  }
}

/**
 * Check if an artist has a profile image available
 */
export function hasArtistImage(artistName: string): boolean {
  return getArtistImagePath(artistName) !== null;
}
