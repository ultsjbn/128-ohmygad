import React, { useState } from 'react';

const Colors = {
  Blue:    'blue',
  Body:    'body',
  Error:   'error',
  Green:   'green',
  Pink:    'pink',
  Purple:  'purple',
  Success: 'success',
  Warning: 'warning',
  Yellow:  'yellow',
} as const;

type Color = typeof Colors[keyof typeof Colors];

const colorStyles: Record<Color, { bg: string; border: string; text: string; }> = {
  pink: {
    bg:     'var(--color-decorative-pink-90)',
    border: 'var(--color-brand-primary)',
    text:   'var(--color-text-dark)',
  },
  blue: {
    bg:     'var(--color-decorative-blue-90)',
    border: 'var(--color-decorative-blue-50)',
    text:   'var(--color-text-dark)',
  },
  green: {
    bg:     'var(--color-decorative-green-90)',
    border: 'var(--color-decorative-green-50)',
    text:   'var(--color-text-dark)',
  },
  purple: {
    bg:     'var(--color-decorative-purple-90)',
    border: 'var(--color-decorative-purple-50)',
    text:   'var(--color-text-dark)',
  },
  yellow: {
    bg:     'var(--color-decorative-yellow-90)',
    border: 'var(--color-decorative-yellow-50)',
    text:   'var(--color-text-dark)',
  },
  error: {
    bg:     'var(--color-feedback-error-90)',
    border: 'var(--color-feedback-error-50)',
    text:   'var(--color-text-error)',
  },
  success: {
    bg:     'var(--color-feedback-success-90)',
    border: 'var(--color-feedback-success-50)',
    text:   'var(--color-text-success)',
  },
  warning: {
    bg:     'var(--color-feedback-warning-90)',
    border: 'var(--color-feedback-warning-50)',
    text:   'var(--color-text-warning)',
  },
  body: {
    bg:     'var(--color-background-body-default)',
    border: 'var(--color-border-default)',
    text:   'var(--color-text-default)',
  },
};

const fontSizeMap = {
  '1': '1rem',   // body-1 / normal
  '2': '0.875rem', // body-2 / small
} as const;

type FontSize = 1 | 2 | 'body-1' | 'body-2' | 'normal' | 'small' | '1' | '2';

interface CardProps extends Omit<React.AllHTMLAttributes<HTMLDivElement>, 'title'> {
  children?: React.ReactNode;
  color?: Color;
  dismissable?: boolean;
  dismissButtonLabel?: string;
  fontSize?: FontSize;
  icon?: React.ReactNode;
  title?: React.ReactNode;
  onDismiss?: () => void;
}

function normalizeFontSize(fontSize: FontSize = '1'): '1' | '2' {
  if (fontSize === 2 || fontSize === 'body-2' || fontSize === 'small' || fontSize === '2') return '2';
  return '1';
}

const Card = ({
  children,
  color = 'pink',
  dismissable = false,
  dismissButtonLabel = 'Dismiss',
  fontSize = '1',
  icon,
  title,
  onDismiss,
  style,
  ...props
}: CardProps) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const { bg, border, text } = colorStyles[color] ?? colorStyles.pink;
  const resolvedFontSize = fontSizeMap[normalizeFontSize(fontSize)];

  return (
    <div
      style={{
        padding: 'var(--size-spacing-1)',
        borderRadius: 'var(--size-radius-s)',
        border: `var(--size-border-2) solid ${border}`,
        backgroundColor: bg,
        color: text,
        fontSize: resolvedFontSize,
        fontFamily: 'var(--font-family-normal)',
        fontWeight: 'var(--font-weight-standard)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--size-spacing-1)',
        ...style,
      }}
      {...props}
    >
      {/* Header row: icon + title + dismiss */}
      {(icon || title || dismissable) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 'var(--size-spacing-1)',
            padding: 'var(--size-spacing-1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-spacing-1)' }}>
            {icon && (
              <span style={{ color: border, flexShrink: 0, lineHeight: 1 }}>
                {icon}
              </span>
            )}
            {title && (
              <div
                style={{
                  fontWeight: 'var(--font-weight-median)',
                  fontSize: resolvedFontSize,
                  color: text,
                }}
              >
                {title}
              </div>
            )}
          </div>

          {dismissable && (
            <button
              onClick={handleDismiss}
              aria-label={dismissButtonLabel}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: text,
                opacity: 0.6,
                fontSize: '1.25rem',
                lineHeight: 1,
                padding: 0,
                flexShrink: 0,
                fontFamily: 'var(--font-family-normal)',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
            >
              ×
            </button>
          )}
        </div>
      )}

        {/* Body */}
        {children && (
            <div style={{ color: text, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                {children}
            </div>
        )}
    </div>
  );
};

Card.displayName = 'Card';

export { Card, Colors };
export type { CardProps };