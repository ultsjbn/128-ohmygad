import React, { forwardRef } from 'react';
import './typography.css';
import { TypographyProps } from './typography.types';
import { DEFAULT_VARIANT, VARIANTS_MAPPING, DEFAULT_ELEMENT } from './typography.constants';

const Typography = forwardRef<HTMLElement, TypographyProps>(
  (
    {
      children,
      element,
      variant = DEFAULT_VARIANT,
      fullStyle,
      inlineStyle,
      xs,
      disableClickTracking,
      className = '',
      ...restProps
    },
    ref
  ) => {
    const Component = element || VARIANTS_MAPPING[variant] || DEFAULT_ELEMENT;

    const classes = [
      'custom-typography',
      `typography--${variant}`,
      fullStyle ? 'typography--full-style' : '',
      inlineStyle ? 'typography--inline' : '',
      xs ? 'typography--xs' : '',
      className
    ].filter(Boolean).join(' ');

    const handleClickProps = disableClickTracking 
        ? { onClick: undefined } 
        : {};

    return (
      <Component 
        ref={ref} 
        className={classes} 
        {...handleClickProps}
        {...restProps}
      >
        {children}
      </Component>
    );
  }
);

Typography.displayName = 'Typography';

export default Typography;