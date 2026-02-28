// components/card/Card.tsx
"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Typography } from '../typography';
import { CardProps } from './card.types';

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      color = 'pink',
      dismissable = false,
      dismissButtonLabel = 'Dismiss',
      fontSize = 'body-1',
      icon,
      title,
      onDismiss,
      className = '',
      ...restProps
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(true);

    const handleDismiss = () => {
      setIsVisible(false);
      onDismiss?.();
    };

    if (!isVisible) return null;

    const getColorClasses = (c: string) => {
      switch (c) {
        case 'blue': return 'bg-fractal-decorative-blue-90';
        case 'green': return 'bg-fractal-decorative-green-90';
        case 'pink': return 'bg-fractal-decorative-pink-90';
        case 'purple': return 'bg-fractal-decorative-purple-90';
        case 'yellow': return 'bg-fractal-decorative-yellow-90';
        case 'error': return 'bg-fractal-feedback-error-90';
        case 'success': return 'bg-fractal-feedback-success-90';
        case 'warning': return 'bg-fractal-feedback-warning-90';
        case 'body':
        default: return 'bg-white';
      }
    };

    const bodyVariant = ['2', 'body-2', 'small'].includes(String(fontSize)) ? 'body-2' : 'body-1';

    const baseClasses = [
      getColorClasses(color),
      'border-2 border-fractal-border-default shadow-brutal-1 rounded-lg p-4 flex flex-col',
      className
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={baseClasses} {...restProps}>
        {(title || icon || dismissable) && (
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {icon && <span className="shrink-0 text-fractal-icon-default">{icon}</span>}
              {title && (
                <Typography variant="heading-4">
                  {title}
                </Typography>
              )}
            </div>
            
            {dismissable && (
              <button
                type="button"
                onClick={handleDismiss}
                aria-label={dismissButtonLabel}
                className="shrink-0 p-1 -mr-2 -mt-2 rounded-md hover:bg-black/5 transition-colors text-fractal-icon-default"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1">
          {typeof children === 'string' ? (
            <Typography variant={bodyVariant}>{children}</Typography>
          ) : (
            children
          )}
        </div>
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;