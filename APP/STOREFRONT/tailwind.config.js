/** @type {import('tailwindcss').Config} */
export default{
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      /* --------------------------------------------------------------------
         1. COLORS (PRIMITIVE + SEMANTIC TOKENS)
         -------------------------------------------------------------------- */
      colors: {
        // Primitive palette
        navy: {
          900: "#14213d",
          950: "#0d1629",
        },
        blue: {
          50: "#eff6ff",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
        },
        cyan: {
          50: "#ecfeff",
          200: "#a5f3fc",
          500: "#06b6d4",
        },
        slate: {
          50: "#f8fafc",
          200: "#e2e8f0",
          500: "#64748b",
          900: "#0f172a",
        },
        green: {
          50: "#f0fdf4",
          200: "#bbf7d0",
          600: "#16a34a",
        },
        amber: {
          50: "#fffbeb",
          200: "#fde68a",
          600: "#d97706",
        },
        red: {
          50: "#fef2f2",
          200: "#fecaca",
          600: "#dc2626",
        },

        // Semantic tokens backed by CSS custom properties (with fallbacks)
        page: "var(--bg-page, #f8fafc)",
        surface: {
          DEFAULT: "var(--bg-surface, #ffffff)",
          subtle: "var(--bg-surface-subtle, #f8fafc)",
          elevated: "var(--bg-surface-elevated, #ffffff)",
        },
        overlay: "var(--bg-overlay, rgba(15, 23, 42, 0.5))",

        ink: {
          DEFAULT: "var(--text-primary, #0f172a)",
          secondary: "var(--text-secondary, #64748b)",
          muted: "var(--text-muted, #64748b)",
          "on-primary": "var(--text-on-primary, #ffffff)",
          "on-secondary": "var(--text-on-secondary, #ffffff)",
          "on-accent": "var(--text-on-accent, #0f172a)",
          link: "var(--text-link, #2563eb)",
          "link-hover": "var(--text-link-hover, #14213d)",
        },

        brand: {
          primary: "var(--brand-primary, #14213d)",
          secondary: "var(--brand-secondary, #2563eb)",
          accent: "var(--brand-accent, #06b6d4)",
        },

        action: {
          "primary-bg": "var(--action-primary-bg, #14213d)",
          "primary-hover": "var(--action-primary-hover, #0d1629)",
          "primary-active": "var(--action-primary-active, #080e1a)",
          "primary-text": "var(--action-primary-text, #ffffff)",
          "secondary-bg": "var(--action-secondary-bg, #2563eb)",
          "secondary-hover": "var(--action-secondary-hover, #1d4ed8)",
          "secondary-active": "var(--action-secondary-active, #1e40af)",
          "secondary-text": "var(--action-secondary-text, #ffffff)",
          "accent-bg": "var(--action-accent-bg, #06b6d4)",
          "accent-text": "var(--action-accent-text, #0f172a)",
          "disabled-bg": "var(--action-disabled-bg, #e2e8f0)",
          "disabled-text": "var(--action-disabled-text, #64748b)",
        },

        border: {
          DEFAULT: "var(--border-default, #e2e8f0)",
          subtle: "var(--border-subtle, #e2e8f0)",
          strong: "var(--border-strong, #64748b)",
          focus: "var(--border-focus, #2563eb)",
        },

        focus: {
          ring: "var(--focus-ring-color, #2563eb)",
          offset: "var(--focus-ring-offset, #ffffff)",
        },

        status: {
          "success-bg": "var(--status-success-bg, #f0fdf4)",
          "success-border": "var(--status-success-border, #bbf7d0)",
          "success-text": "var(--status-success-text, #16a34a)",
          "warning-bg": "var(--status-warning-bg, #fffbeb)",
          "warning-border": "var(--status-warning-border, #fde68a)",
          "warning-text": "var(--status-warning-text, #d97706)",
          "error-bg": "var(--status-error-bg, #fef2f2)",
          "error-border": "var(--status-error-border, #fecaca)",
          "error-text": "var(--status-error-text, #dc2626)",
          "info-bg": "var(--status-info-bg, #ecfeff)",
          "info-border": "var(--status-info-border, #a5f3fc)",
          "info-text": "var(--status-info-text, #14213d)",
        },
      },

      /* --------------------------------------------------------------------
         2. TYPOGRAPHY
         -------------------------------------------------------------------- */
      fontFamily: {
        sans: [
          "Inter",
          "Roboto",
          "Manrope",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "sans-serif",
        ],
      },
      fontSize: {
        display: [
          "var(--font-size-display, clamp(2rem, 1.5rem + 2vw, 3rem))",
          { lineHeight: "var(--line-height-tight, 1.15)", letterSpacing: "var(--tracking-tight, -0.02em)" },
        ],
        "page-heading": [
          "var(--font-size-page-heading, clamp(1.625rem, 1.3rem + 1.2vw, 2.25rem))",
          { lineHeight: "var(--line-height-heading, 1.25)", letterSpacing: "var(--tracking-tight, -0.02em)" },
        ],
        "section-heading": [
          "var(--font-size-section-heading, clamp(1.25rem, 1.1rem + 0.7vw, 1.75rem))",
          { lineHeight: "var(--line-height-heading, 1.25)", letterSpacing: "var(--tracking-tight, -0.02em)" },
        ],
        subheading: [
          "var(--font-size-subheading, clamp(1.125rem, 1.05rem + 0.25vw, 1.25rem))",
          { lineHeight: "var(--line-height-heading, 1.25)" },
        ],
        body: [
          "var(--font-size-body, 1rem)",
          { lineHeight: "var(--line-height-body, 1.5)" },
        ],
        supporting: [
          "var(--font-size-supporting, 0.875rem)",
          { lineHeight: "var(--line-height-body, 1.5)" },
        ],
        label: [
          "var(--font-size-label, 0.75rem)",
          { lineHeight: "var(--line-height-body, 1.5)", letterSpacing: "var(--tracking-wide, 0.02em)" },
        ],
        button: [
          "var(--font-size-button, clamp(0.875rem, 0.85rem + 0.1vw, 1rem))",
          { lineHeight: "1.2" },
        ],
      },
      fontWeight: {
        regular: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
      },

      /* --------------------------------------------------------------------
         3. SPACING & LAYOUT
         -------------------------------------------------------------------- */
      spacing: {
        xs: "var(--space-xs, 0.25rem)",     // 4px
        sm: "var(--space-sm, 0.5rem)",      // 8px
        md: "var(--space-md, 0.75rem)",     // 12px
        lg: "var(--space-lg, 1rem)",        // 16px
        xl: "var(--space-xl, 1.5rem)",      // 24px
        "2xl": "var(--space-2xl, 2rem)",    // 32px
        "3xl": "var(--space-3xl, 3rem)",    // 48px
        "4xl": "var(--space-4xl, 4rem)",    // 64px
        "5xl": "var(--space-5xl, 5rem)",    // 80px
        "touch-min": "var(--touch-target-min, 2.75rem)", // 44px
        "admin-sidebar": "var(--admin-sidebar-width, 16.25rem)",
        "admin-sidebar-collapsed": "var(--admin-sidebar-collapsed-width, 4.5rem)",
        "admin-header": "var(--admin-header-height, 4rem)",
        "storefront-header": "var(--storefront-header-height, 4.5rem)",
      },
      maxWidth: {
        storefront: "var(--container-storefront-max, 80rem)",
      },
      screens: {
        "mobile-lg": "480px",
        tablet: "768px",
        laptop: "1024px",
        desktop: "1280px",
      },

      /* --------------------------------------------------------------------
         4. BORDER RADIUS, SHADOWS, MEDIA, MOTION & Z-INDEX
         -------------------------------------------------------------------- */
      borderRadius: {
        none: "var(--radius-none, 0px)",
        sm: "var(--radius-sm, 0.25rem)",
        md: "var(--radius-md, 0.5rem)",
        lg: "var(--radius-lg, 0.75rem)",
        xl: "var(--radius-xl, 1rem)",
        full: "var(--radius-full, 9999px)",
      },
      boxShadow: {
        none: "var(--shadow-none, none)",
        sm: "var(--shadow-sm, 0 1px 2px 0 rgba(15, 23, 42, 0.05))",
        md: "var(--shadow-md, 0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05))",
        lg: "var(--shadow-lg, 0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.05))",
      },
      aspectRatio: {
        product: "4 / 3",
      },
      transitionDuration: {
        fast: "var(--duration-fast, 120ms)",
        normal: "var(--duration-normal, 200ms)",
        slow: "var(--duration-slow, 300ms)",
      },
      transitionTimingFunction: {
        standard: "var(--ease-standard, cubic-bezier(0.2, 0, 0, 1))",
      },
      zIndex: {
        base: "var(--z-base, 0)",
        sticky: "var(--z-sticky, 20)",
        header: "var(--z-header, 30)",
        sidebar: "var(--z-sidebar, 40)",
        dropdown: "var(--z-dropdown, 50)",
        modal: "var(--z-modal, 60)",
        toast: "var(--z-toast, 70)",
      },
    },
  },
  plugins: [],
};