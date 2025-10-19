/**
 * ===================================
 * PRESUSIMPLE APP THEME
 * ===================================
 *
 * Centralized theme configuration for consistent design across web and mobile.
 *
 * MOBILE DEVELOPERS: Copy this entire file to your mobile app!
 * All colors are provided in multiple formats: HSL, RGB, and HEX
 *
 * Color format explanations:
 * - HSL: Hue (0-360), Saturation (0-100%), Lightness (0-100%)
 * - RGB: Red (0-255), Green (0-255), Blue (0-255)
 * - HEX: Hexadecimal color code (e.g., #070919)
 */

export const theme = {
  /**
   * ===================================
   * BRAND COLORS
   * ===================================
   * Core brand identity colors for Presusimple
   */
  brand: {
    primary: {
      hsl: '222.2 84% 4.9%',
      rgb: 'rgb(7, 9, 25)',
      hex: '#070919',
      description: 'Primary brand color - Dark slate blue',
    },
    primaryLight: {
      hsl: '210 40% 98%',
      rgb: 'rgb(247, 249, 252)',
      hex: '#F7F9FC',
      description: 'Light variant of primary',
    },
    accent: {
      hsl: '217.2 32.6% 17.5%',
      rgb: 'rgb(30, 39, 56)',
      hex: '#1E2738',
      description: 'Accent color - Mid-dark slate',
    },
  },

  /**
   * ===================================
   * SEMANTIC COLORS
   * ===================================
   * Colors with specific meanings (success, error, warning, info)
   */
  semantic: {
    success: {
      hsl: '142 76% 36%',
      rgb: 'rgb(22, 163, 74)',
      hex: '#16A34A',
      foreground: {
        hsl: '210 40% 98%',
        rgb: 'rgb(247, 249, 252)',
        hex: '#F7F9FC',
      },
      description: 'Success/positive state - Green',
    },
    warning: {
      hsl: '38 92% 50%',
      rgb: 'rgb(245, 158, 11)',
      hex: '#F59E0B',
      foreground: {
        hsl: '222.2 84% 4.9%',
        rgb: 'rgb(7, 9, 25)',
        hex: '#070919',
      },
      description: 'Warning state - Orange/Amber',
    },
    error: {
      hsl: '0 62.8% 30.6%',
      rgb: 'rgb(127, 29, 29)',
      hex: '#7F1D1D',
      foreground: {
        hsl: '210 40% 98%',
        rgb: 'rgb(247, 249, 252)',
        hex: '#F7F9FC',
      },
      description: 'Error/danger state (dark mode) - Dark red',
    },
    errorLight: {
      hsl: '0 84.2% 60.2%',
      rgb: 'rgb(239, 68, 68)',
      hex: '#EF4444',
      foreground: {
        hsl: '210 40% 98%',
        rgb: 'rgb(247, 249, 252)',
        hex: '#F7F9FC',
      },
      description: 'Error/danger state (light mode) - Bright red',
    },
    info: {
      hsl: '217 91% 60%',
      rgb: 'rgb(59, 130, 246)',
      hex: '#3B82F6',
      foreground: {
        hsl: '210 40% 98%',
        rgb: 'rgb(247, 249, 252)',
        hex: '#F7F9FC',
      },
      description: 'Informational state - Blue',
    },
  },

  /**
   * ===================================
   * CHART COLORS
   * ===================================
   * Colors for data visualization and charts
   */
  chart: {
    colors: [
      { hsl: '210 40% 98%', rgb: 'rgb(247, 249, 252)', hex: '#F7F9FC', name: 'Chart 1 - Light gray' },
      { hsl: '217 91% 60%', rgb: 'rgb(59, 130, 246)', hex: '#3B82F6', name: 'Chart 2 - Blue' },
      { hsl: '142 76% 36%', rgb: 'rgb(22, 163, 74)', hex: '#16A34A', name: 'Chart 3 - Green' },
      { hsl: '38 92% 50%', rgb: 'rgb(245, 158, 11)', hex: '#F59E0B', name: 'Chart 4 - Orange' },
      { hsl: '0 62.8% 30.6%', rgb: 'rgb(127, 29, 29)', hex: '#7F1D1D', name: 'Chart 5 - Red' },
    ],
  },

  /**
   * ===================================
   * DARK THEME
   * ===================================
   * Complete color palette for dark mode
   */
  dark: {
    background: {
      base: {
        hsl: '222.2 84% 4.9%',
        rgb: 'rgb(7, 9, 25)',
        hex: '#070919',
      },
      gradient: {
        start: { rgb: 'rgb(15, 23, 42)', hex: '#0F172A' },
        middle: { rgb: 'rgb(30, 41, 59)', hex: '#1E293B' },
        end: { rgb: 'rgb(51, 65, 85)', hex: '#334155' },
        css: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
      },
    },
    foreground: {
      hsl: '210 40% 98%',
      rgb: 'rgb(247, 249, 252)',
      hex: '#F7F9FC',
    },
    card: {
      background: {
        hsl: '222.2 84% 4.9%',
        rgb: 'rgb(7, 9, 25)',
        hex: '#070919',
      },
      foreground: {
        hsl: '210 40% 98%',
        rgb: 'rgb(247, 249, 252)',
        hex: '#F7F9FC',
      },
    },
    popover: {
      background: {
        hsl: '222.2 84% 4.9%',
        rgb: 'rgb(7, 9, 25)',
        hex: '#070919',
      },
      foreground: {
        hsl: '210 40% 98%',
        rgb: 'rgb(247, 249, 252)',
        hex: '#F7F9FC',
      },
    },
    primary: {
      base: {
        hsl: '210 40% 98%',
        rgb: 'rgb(247, 249, 252)',
        hex: '#F7F9FC',
      },
      foreground: {
        hsl: '222.2 84% 4.9%',
        rgb: 'rgb(7, 9, 25)',
        hex: '#070919',
      },
    },
    secondary: {
      base: {
        hsl: '217.2 32.6% 17.5%',
        rgb: 'rgb(30, 39, 56)',
        hex: '#1E2738',
      },
      foreground: {
        hsl: '210 40% 98%',
        rgb: 'rgb(247, 249, 252)',
        hex: '#F7F9FC',
      },
    },
    muted: {
      base: {
        hsl: '217.2 32.6% 17.5%',
        rgb: 'rgb(30, 39, 56)',
        hex: '#1E2738',
      },
      foreground: {
        hsl: '215 20.2% 65.1%',
        rgb: 'rgb(148, 163, 184)',
        hex: '#94A3B8',
      },
    },
    accent: {
      base: {
        hsl: '217.2 32.6% 17.5%',
        rgb: 'rgb(30, 39, 56)',
        hex: '#1E2738',
      },
      foreground: {
        hsl: '210 40% 98%',
        rgb: 'rgb(247, 249, 252)',
        hex: '#F7F9FC',
      },
    },
    border: {
      hsl: '217.2 32.6% 17.5%',
      rgb: 'rgb(30, 39, 56)',
      hex: '#1E2738',
    },
    input: {
      hsl: '217.2 32.6% 17.5%',
      rgb: 'rgb(30, 39, 56)',
      hex: '#1E2738',
    },
    ring: {
      hsl: '210 40% 98%',
      rgb: 'rgb(247, 249, 252)',
      hex: '#F7F9FC',
    },
  },

  /**
   * ===================================
   * LIGHT THEME
   * ===================================
   * Complete color palette for light mode
   */
  light: {
    background: {
      base: {
        hsl: '0 0% 100%',
        rgb: 'rgb(255, 255, 255)',
        hex: '#FFFFFF',
      },
      gradient: {
        start: { rgb: 'rgb(255, 255, 255)', hex: '#FFFFFF' },
        middle: { rgb: 'rgb(241, 245, 249)', hex: '#F1F5F9' },
        end: { rgb: 'rgb(226, 232, 240)', hex: '#E2E8F0' },
        css: 'linear-gradient(135deg, #FFFFFF 0%, #F1F5F9 50%, #E2E8F0 100%)',
      },
    },
    foreground: {
      hsl: '222.2 84% 4.9%',
      rgb: 'rgb(7, 9, 25)',
      hex: '#070919',
    },
    card: {
      background: {
        hsl: '0 0% 100%',
        rgb: 'rgb(255, 255, 255)',
        hex: '#FFFFFF',
      },
      foreground: {
        hsl: '222.2 84% 4.9%',
        rgb: 'rgb(7, 9, 25)',
        hex: '#070919',
      },
    },
    popover: {
      background: {
        hsl: '0 0% 100%',
        rgb: 'rgb(255, 255, 255)',
        hex: '#FFFFFF',
      },
      foreground: {
        hsl: '222.2 84% 4.9%',
        rgb: 'rgb(7, 9, 25)',
        hex: '#070919',
      },
    },
    primary: {
      base: {
        hsl: '222.2 84% 4.9%',
        rgb: 'rgb(7, 9, 25)',
        hex: '#070919',
      },
      foreground: {
        hsl: '210 40% 98%',
        rgb: 'rgb(247, 249, 252)',
        hex: '#F7F9FC',
      },
    },
    secondary: {
      base: {
        hsl: '210 40% 96.1%',
        rgb: 'rgb(241, 245, 249)',
        hex: '#F1F5F9',
      },
      foreground: {
        hsl: '222.2 84% 4.9%',
        rgb: 'rgb(7, 9, 25)',
        hex: '#070919',
      },
    },
    muted: {
      base: {
        hsl: '210 40% 96.1%',
        rgb: 'rgb(241, 245, 249)',
        hex: '#F1F5F9',
      },
      foreground: {
        hsl: '215.4 16.3% 46.9%',
        rgb: 'rgb(100, 116, 139)',
        hex: '#64748B',
      },
    },
    accent: {
      base: {
        hsl: '210 40% 96.1%',
        rgb: 'rgb(241, 245, 249)',
        hex: '#F1F5F9',
      },
      foreground: {
        hsl: '222.2 84% 4.9%',
        rgb: 'rgb(7, 9, 25)',
        hex: '#070919',
      },
    },
    border: {
      hsl: '214.3 31.8% 91.4%',
      rgb: 'rgb(226, 232, 240)',
      hex: '#E2E8F0',
    },
    input: {
      hsl: '214.3 31.8% 91.4%',
      rgb: 'rgb(226, 232, 240)',
      hex: '#E2E8F0',
    },
    ring: {
      hsl: '222.2 84% 4.9%',
      rgb: 'rgb(7, 9, 25)',
      hex: '#070919',
    },
  },

  /**
   * ===================================
   * BUDGET PROGRESS COLORS
   * ===================================
   * Gradient colors for budget progress indicators
   */
  budgetProgress: {
    success: {
      from: { rgb: 'rgb(52, 211, 153)', hex: '#34D399', name: 'emerald-400' },
      to: { rgb: 'rgb(16, 185, 129)', hex: '#10B981', name: 'emerald-500' },
      gradient: 'linear-gradient(to right, #34D399, #10B981)',
    },
    warning: {
      from: { rgb: 'rgb(251, 191, 36)', hex: '#FBBF24', name: 'yellow-400' },
      to: { rgb: 'rgb(251, 146, 60)', hex: '#FB923C', name: 'orange-400' },
      gradient: 'linear-gradient(to right, #FBBF24, #FB923C)',
    },
    danger: {
      from: { rgb: 'rgb(248, 113, 113)', hex: '#F87171', name: 'red-400' },
      to: { rgb: 'rgb(239, 68, 68)', hex: '#EF4444', name: 'red-500' },
      gradient: 'linear-gradient(to right, #F87171, #EF4444)',
    },
  },

  /**
   * ===================================
   * GLASS MORPHISM
   * ===================================
   * Semi-transparent backgrounds with blur effect
   */
  glass: {
    dark: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: 'rgba(255, 255, 255, 0.2)',
      hover: {
        background: 'rgba(255, 255, 255, 0.2)',
        border: 'rgba(255, 255, 255, 0.3)',
      },
      blur: '20px',
    },
    light: {
      background: 'rgba(255, 255, 255, 0.8)',
      border: 'rgba(0, 0, 0, 0.1)',
      hover: {
        background: 'rgba(255, 255, 255, 0.9)',
        border: 'rgba(0, 0, 0, 0.2)',
      },
      blur: '20px',
    },
  },

  /**
   * ===================================
   * SPACING & LAYOUT
   * ===================================
   * Consistent spacing and layout values
   */
  spacing: {
    // Basic spacing scale
    0: '0',
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    8: '2rem',     // 32px
    10: '2.5rem',  // 40px
    12: '3rem',    // 48px
    16: '4rem',    // 64px
    20: '5rem',    // 80px
    24: '6rem',    // 96px

    // Border radius
    radius: {
      none: '0',
      sm: '0.5rem',   // 8px
      md: '0.75rem',  // 12px (default)
      lg: '1rem',     // 16px
      xl: '1.5rem',   // 24px
      '2xl': '2rem',  // 32px
      full: '9999px',
    },

    // Touch target (minimum for mobile)
    minTouchTarget: '44px',  // iOS HIG recommendation
  },

  /**
   * ===================================
   * TYPOGRAPHY
   * ===================================
   * Font families and sizes
   */
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: '"SF Mono", "Monaco", "Inconsolata", "Fira Code", "Droid Sans Mono", "Source Code Pro", monospace',
    },
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
      '6xl': '3.75rem',   // 60px
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
  },

  /**
   * ===================================
   * SHADOWS
   * ===================================
   * Shadow definitions for depth and elevation
   */
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  },

  /**
   * ===================================
   * ANIMATION & TRANSITIONS
   * ===================================
   * Timing and easing functions
   */
  animation: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
    easing: {
      linear: 'linear',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
} as const;

/**
 * ===================================
 * UTILITY FUNCTIONS
 * ===================================
 * Helper functions for working with theme
 */

/**
 * Get theme color by path
 * @example getColor('dark.primary.base.hex') => '#F7F9FC'
 */
export function getColor(path: string): string {
  const keys = path.split('.');
  let value: any = theme;

  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) return '';
  }

  return typeof value === 'string' ? value : '';
}

/**
 * Get chart color by index
 */
export function getChartColor(index: number) {
  return theme.chart.colors[index % theme.chart.colors.length];
}

/**
 * Get budget progress color by percentage
 */
export function getBudgetProgressColor(percentage: number): typeof theme.budgetProgress[keyof typeof theme.budgetProgress] {
  if (percentage <= 75) return theme.budgetProgress.success;
  if (percentage <= 95) return theme.budgetProgress.warning;
  return theme.budgetProgress.danger;
}

/**
 * Convert hex to rgba
 */
export function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export default theme;
