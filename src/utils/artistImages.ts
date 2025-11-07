/**
 * Utility functions for mapping artist names to image paths
 *
 * React Native requires static require() paths at build time.
 * All images are imported statically so the bundler can include them.
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
 * Static map of artist names to their imported images
 * All require() calls must be static for React Native bundler
 */
const artistImages: Record<string, any> = {
  'EDGAR V': require('../../assets/images/artist-profiles/EDGAR V.jpg'),
  'JADEN BOJSEN': require('../../assets/images/artist-profiles/JADEN BOJSEN.jpg'),
  'LAVERN': require('../../assets/images/artist-profiles/LAVERN.jpg'),
  'ARGY': require('../../assets/images/artist-profiles/ARGY.jpeg'),
  'PORTER ROBINSON': require('../../assets/images/artist-profiles/PORTER ROBINSON.jpg'),
  'GRYFFIN': require('../../assets/images/artist-profiles/GRYFFIN.jpg'),
  'SARA LANDRY': require('../../assets/images/artist-profiles/SARA LANDRY.webp'),
  'CHRIS LAKE': require('../../assets/images/artist-profiles/CHRIS LAKE.jpg'),
  'ARMIN VAN BUUREN': require('../../assets/images/artist-profiles/ARMIN VAN BUUREN.jpg'),
  'CIRCLE K': require('../../assets/images/artist-profiles/CIRCLE K.jpg'),
  'CANABLISS': require('../../assets/images/artist-profiles/CANABLISS.jpg'),
  'GORILLAT': require('../../assets/images/artist-profiles/GORILLAT.webp'),
  'SUB FOCUS': require('../../assets/images/artist-profiles/SUB FOCUS.webp'),
  'RUDIMENTAL': require('../../assets/images/artist-profiles/RUDIMENTAL.jpg'),
  'VIRTUAL RIOT': require('../../assets/images/artist-profiles/VIRTUAL RIOT.jpeg'),
  'TAPE B': require('../../assets/images/artist-profiles/TAPE B.jpg'),
  'WOOLI': require('../../assets/images/artist-profiles/WOOLI.png'),
  'VOYD': require('../../assets/images/artist-profiles/VOYD SVDDEN DEATH.jpg'),
  'CARLOS MENDOZA': require('../../assets/images/artist-profiles/CARLOS MENDOZA.jpeg'),
  'KASIA': require('../../assets/images/artist-profiles/KASIA.jpg'),
  'BART SKILS': require('../../assets/images/artist-profiles/BART SKILS.jpeg'),
  'MISS MONIQUE': require('../../assets/images/artist-profiles/MISS MONIQUE.jpg'),
  'KEVIN DE VRIES': require('../../assets/images/artist-profiles/KEVIN DE VRIES.jpg'),
  'ADAM BEYER': require('../../assets/images/artist-profiles/ADAM BEYER.webp'),
  'LAYTON GIORDANI': require('../../assets/images/artist-profiles/LAYTON GIORDANI.jpg'),
  'TIFFY VERA': require('../../assets/images/artist-profiles/TIFFY VERA.webp'),
  'SLUGG': require('../../assets/images/artist-profiles/SLUGG.jpg'),
  'MORGAN SEATREE': require('../../assets/images/artist-profiles/MORGAN SEATREE.jpeg'),
  'LUUK VAN DIJK': require('../../assets/images/artist-profiles/LUUK VAN DIJK.jpg'),
  'LUKE DEAN': require('../../assets/images/artist-profiles/LUKE DEAN.jpg'),
  'RIORDAN': require('../../assets/images/artist-profiles/RIORDAN.webp'),
  'AYYBO': require('../../assets/images/artist-profiles/AYYBO.jpg'),
  'PROSPA': require('../../assets/images/artist-profiles/PROSPA.webp'),
  'KETTAMA': require('../../assets/images/artist-profiles/KETTAMA.jpg'),
  'GORGON CITY': require('../../assets/images/artist-profiles/GORGON CITY.jpg'),
};

/**
 * Get the image source for an artist's profile image
 * Returns null if no image mapping exists
 */
export function getArtistImagePath(artistName: string): any | null {
  const normalized = normalizeArtistName(artistName);
  return artistImages[normalized] || null;
}

/**
 * Check if an artist has a profile image available
 */
export function hasArtistImage(artistName: string): boolean {
  return getArtistImagePath(artistName) !== null;
}
