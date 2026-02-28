import { AllHTMLAttributes, ReactNode, ElementType } from 'react';
import { TypographyVariant } from '../typography/typography.types';

export type PaperElevation = '0' | '1' | '2' | '3' | 'flat' | 'bordered' | 'elevated' | 'higher' | 'light';

export interface PaperProps extends Omit<AllHTMLAttributes<HTMLDivElement>, 'onToggle' | 'title'> {
    children: ReactNode;
    collapseButtonLabel?: string;
    collapsed?: boolean;
    collapsible?: boolean;
    contentClassName?: string;
    defaultCollapsed?: boolean;
    element?: ElementType;
    elevation?: PaperElevation;
    expandButtonLabel?: string;
    fullStyle?: boolean;
    inlineStyle?: boolean;
    title?: ReactNode;
    titleClassName?: string;
    titleVariant?: TypographyVariant;
    toggleButtonLabel?: string;
    onCollapse?: () => void;
    onExpand?: () => void;
    onToggle?: (collapsed: boolean) => void;
}