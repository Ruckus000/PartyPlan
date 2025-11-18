import React from 'react';
import Svg, { Path, Rect, Circle, Line, Polyline } from 'react-native-svg';
import { colors } from '../../theme/tokens';

interface IconProps {
  size?: number;
  color?: string;
}

/**
 * Home Tab Icons (Grid/Dashboard)
 */
export function HomeIconOutline({ size = 24, color = colors.textSecondary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="7" height="7" stroke={color} strokeWidth="2" />
      <Rect x="14" y="3" width="7" height="7" stroke={color} strokeWidth="2" />
      <Rect x="14" y="14" width="7" height="7" stroke={color} strokeWidth="2" />
      <Rect x="3" y="14" width="7" height="7" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

export function HomeIconFilled({ size = 24, color = colors.accentSoft }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
    </Svg>
  );
}

/**
 * Plans Tab Icons (Calendar)
 */
export function PlansIconOutline({ size = 24, color = colors.textSecondary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="3"
        y="4"
        width="18"
        height="18"
        rx="2"
        ry="2"
        stroke={color}
        strokeWidth="2"
      />
      <Line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth="2" />
      <Line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth="2" />
      <Line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth="2" />
      <Path
        d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function PlansIconFilled({ size = 24, color = colors.accentSoft }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M8 2v2H5v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3V2h-2v2h-4V2H8zm0 12h2v2H8v-2zm4 0h2v2h-2v-2zm-4 4h2v2H8v-2zm4 0h2v2h-2v-2z" />
      <Rect x="3" y="4" width="18" height="6" rx="1" />
    </Svg>
  );
}

/**
 * Profile Tab Icons (User)
 */
export function ProfileIconOutline({ size = 24, color = colors.textSecondary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle
        cx="12"
        cy="7"
        r="4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ProfileIconFilled({ size = 24, color = colors.accentSoft }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Circle cx="12" cy="7" r="4" />
      <Path d="M12 13c-4 0-7 2-7 5v1h14v-1c0-3-3-5-7-5z" />
    </Svg>
  );
}

/**
 * Search Icon (for header)
 */
export function SearchIcon({ size = 18, color = colors.textPrimary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="11"
        cy="11"
        r="7"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line
        x1="21"
        y1="21"
        x2="16.65"
        y2="16.65"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Plus Icon (for add buttons)
 */
export function PlusIcon({ size = 18, color = colors.textPrimary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line
        x1="12"
        y1="5"
        x2="12"
        y2="19"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Line
        x1="5"
        y1="12"
        x2="19"
        y2="12"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

/**
 * Chevron Right Icon (for settings rows)
 */
export function ChevronRightIcon({ size = 20, color = colors.textMuted }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline
        points="9 18 15 12 9 6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
