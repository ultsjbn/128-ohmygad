import { AllHTMLAttributes, ReactNode, ElementType } from 'react';

export type TypographyVariant = 
    | "body-1" | "body-1-bold" | "body-1-link" | "body-1-median"
    | "body-2" | "body-2-bold" | "body-2-link" | "body-2-median"
    | "caption-bold" | "caption-link" | "caption-median"
    | "display-1" | "display-2" | "display-wide"
    | "heading-1" | "heading-2" | "heading-3" | "heading-3-link"
    | "heading-4" | "heading-4-link";

export interface TypographyProps extends Omit<AllHTMLAttributes<HTMLElement>, 'disabled'> {
    children?: ReactNode;
    element?: ElementType;
    fullStyle?: boolean;
    inlineStyle?: boolean;
    variant?: TypographyVariant;
    xs?: boolean;
    disableClickTracking?: boolean;
}