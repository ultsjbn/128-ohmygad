"use client";

import React, { useState, forwardRef } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Typography } from '../typography';
import { PaperProps } from './paper.types';

const Paper = forwardRef<HTMLDivElement, PaperProps>(
  (
    {
      children,
      collapseButtonLabel,
      collapsed: controlledCollapsed,
      collapsible = false,
      contentClassName = '',
      defaultCollapsed = false,
      element: Component = 'div',
      elevation = 'bordered',
      expandButtonLabel,
      fullStyle,
      inlineStyle,
      title,
      titleClassName = '',
      titleVariant = 'heading-4',
      toggleButtonLabel,
      onCollapse,
      onExpand,
      onToggle,
      className = '',
      ...restProps
    },
    ref
  ) => {
    const [isCollapsedState, setIsCollapsedState] = useState(defaultCollapsed);
    const isControlled = controlledCollapsed !== undefined;
    const isCollapsed = isControlled ? controlledCollapsed : isCollapsedState;

    const handleToggle = () => {
      const newState = !isCollapsed;
      if (!isControlled) {
        setIsCollapsedState(newState);
      }
      if (newState) {
        onCollapse?.();
      } else {
        onExpand?.();
      }
      onToggle?.(newState);
    };

    const getElevationClasses = (elev: string) => {
      switch (elev) {
        case '0':
        case 'flat':
          return 'border-2 border-transparent';
        case '1':
        case 'bordered':
          return 'border-2 border-fractal-border-default';
        case '2':
        case 'elevated':
          return 'border-2 border-fractal-border-default shadow-brutal-1';
        case '3':
        case 'higher':
          return 'border-2 border-fractal-border-default shadow-brutal-2';
        case 'light':
          return 'border border-fractal-border-default opacity-80';
        default:
          return 'border-2 border-fractal-border-default';
      }
    };

    const baseClasses = [
      'bg-white text-fractal-text-default rounded-lg',
      getElevationClasses(String(elevation)),
      'flex flex-col overflow-hidden',
      fullStyle ? 'w-full block' : '',
      inlineStyle ? 'inline-block' : '',
      className
    ].filter(Boolean).join(' ');

    return (
      <Component ref={ref} className={baseClasses} {...restProps}>
        
        {/* Header / Title Area */}
        {(title || collapsible) && (
          <div
            className={`flex items-center justify-between px-3 py-3 shrink-0 ${
              collapsible ? 'cursor-pointer select-none hover:bg-black/5 transition-colors' : ''
            }`}
            onClick={collapsible ? handleToggle : undefined}
            role={collapsible ? 'button' : undefined}
          >
            {title && (
              <Typography variant={titleVariant} className={titleClassName}>
                {title}
              </Typography>
            )}
            
            {collapsible && (
              <button
                type="button"
                className="p-1 rounded-md text-foreground transition-transform duration-200"
                aria-label={
                  isCollapsed
                    ? expandButtonLabel || toggleButtonLabel || 'Expand'
                    : collapseButtonLabel || toggleButtonLabel || 'Collapse'
                }
              >
                {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
              </button>
            )}
          </div>
        )}

        {/* Content Area */}
        {(!collapsible || !isCollapsed) && (
          <div className={`p-4 ${title || collapsible ? 'pt-0' : ''} flex-1 flex flex-col min-h-0 w-full ${contentClassName}`}>
            {children}
          </div>
        )}
      </Component>
    );
  }
);

Paper.displayName = 'Paper';

export default Paper;