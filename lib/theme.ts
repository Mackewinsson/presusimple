// Theme utility functions and constants
export const theme = {
  // Color palette
  colors: {
    // Base colors
    background: 'hsl(var(--background))',
    foreground: 'hsl(var(--foreground))',
    
    // Card colors
    card: 'hsl(var(--card))',
    cardForeground: 'hsl(var(--card-foreground))',
    
    // Popover colors
    popover: 'hsl(var(--popover))',
    popoverForeground: 'hsl(var(--popover-foreground))',
    
    // Primary colors
    primary: 'hsl(var(--primary))',
    primaryForeground: 'hsl(var(--primary-foreground))',
    
    // Secondary colors
    secondary: 'hsl(var(--secondary))',
    secondaryForeground: 'hsl(var(--secondary-foreground))',
    
    // Muted colors
    muted: 'hsl(var(--muted))',
    mutedForeground: 'hsl(var(--muted-foreground))',
    
    // Accent colors
    accent: 'hsl(var(--accent))',
    accentForeground: 'hsl(var(--accent-foreground))',
    
    // Destructive colors
    destructive: 'hsl(var(--destructive))',
    destructiveForeground: 'hsl(var(--destructive-foreground))',
    
    // Border and input colors
    border: 'hsl(var(--border))',
    input: 'hsl(var(--input))',
    ring: 'hsl(var(--ring))',
    
    // Success colors
    success: 'hsl(var(--success))',
    successForeground: 'hsl(var(--success-foreground))',
    
    // Warning colors
    warning: 'hsl(var(--warning))',
    warningForeground: 'hsl(var(--warning-foreground))',
    
    // Info colors
    info: 'hsl(var(--info))',
    infoForeground: 'hsl(var(--info-foreground))',
    
    // Chart colors
    chart1: 'hsl(var(--chart-1))',
    chart2: 'hsl(var(--chart-2))',
    chart3: 'hsl(var(--chart-3))',
    chart4: 'hsl(var(--chart-4))',
    chart5: 'hsl(var(--chart-5))',
  },
  
  // Spacing
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  
  // Border radius
  radius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  },
  
  // Transitions
  transitions: {
    fast: '150ms ease-in-out',
    normal: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  },
} as const;

// Theme-aware color functions
export const getThemeColor = (color: keyof typeof theme.colors) => {
  return theme.colors[color];
};

// Chart color utilities
export const getChartColor = (index: number) => {
  const chartColors = [
    theme.colors.chart1,
    theme.colors.chart2,
    theme.colors.chart3,
    theme.colors.chart4,
    theme.colors.chart5,
  ];
  return chartColors[index % chartColors.length];
};

// Status color utilities
export const getStatusColor = (status: 'success' | 'warning' | 'info' | 'destructive') => {
  const statusColors = {
    success: theme.colors.success,
    warning: theme.colors.warning,
    info: theme.colors.info,
    destructive: theme.colors.destructive,
  };
  return statusColors[status];
};

// CSS variable helpers
export const cssVar = (name: string) => `var(--${name})`;

// Theme-aware class utilities
export const themeClasses = {
  // Glass morphism
  glass: 'backdrop-blur-xl border border-white/20 bg-white/10 dark:bg-white/10 light:bg-white/80',
  glassDark: 'backdrop-blur-xl border border-white/10 bg-black/20 dark:bg-black/20 light:bg-black/10',
  
  // Cards
  card: 'bg-card text-card-foreground border border-border rounded-xl shadow-lg',
  cardHover: 'hover:shadow-xl hover:scale-[1.02] transition-all duration-200',
  
  // Buttons
  buttonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  buttonSecondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  buttonOutline: 'border border-border bg-background hover:bg-accent hover:text-accent-foreground',
  buttonDestructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  
  // Inputs
  input: 'border border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring',
  
  // Status indicators
  statusSuccess: 'bg-success text-success-foreground',
  statusWarning: 'bg-warning text-warning-foreground',
  statusInfo: 'bg-info text-info-foreground',
  statusDestructive: 'bg-destructive text-destructive-foreground',
} as const;

// Theme context type
export type Theme = 'light' | 'dark' | 'system';

// Theme utilities for components
export const useThemeColors = () => {
  return {
    // Background colors
    background: theme.colors.background,
    card: theme.colors.card,
    popover: theme.colors.popover,
    
    // Text colors
    foreground: theme.colors.foreground,
    muted: theme.colors.mutedForeground,
    
    // Interactive colors
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    accent: theme.colors.accent,
    destructive: theme.colors.destructive,
    
    // Border colors
    border: theme.colors.border,
    
    // Status colors
    success: theme.colors.success,
    warning: theme.colors.warning,
    info: theme.colors.info,
    
    // Chart colors
    chartColors: [
      theme.colors.chart1,
      theme.colors.chart2,
      theme.colors.chart3,
      theme.colors.chart4,
      theme.colors.chart5,
    ],
  };
}; 