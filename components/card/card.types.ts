import { AllHTMLAttributes, ReactNode } from 'react';

export type CardColor = 'blue' | 'body' | 'error' | 'green' | 'pink' | 'purple' | 'success' | 'warning' | 'yellow';
export type CardFontSize = '1' | '2' | 'body-1' | 'body-2' | 'normal' | 'small';

export interface CardProps extends Omit<AllHTMLAttributes<HTMLDivElement>, 'title'> {
    children?: ReactNode;
    color?: CardColor;
    dismissable?: boolean;
    dismissButtonLabel?: string;
    fontSize?: CardFontSize;
    icon?: ReactNode;
    title?: ReactNode;
    onDismiss?: () => void;
}