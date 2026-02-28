import { ElementType } from 'react';
import { TypographyVariant } from './typography.types';

export const GROUP_NAME = "typography";

export const DEFAULT_VARIANT: TypographyVariant = "body-1";
export const DEFAULT_ELEMENT: ElementType = 'p';

export const VARIANTS_MAPPING: Record<TypographyVariant, ElementType> = {
    "body-1": 'p',
    "body-1-bold": 'p',
    "body-1-link": 'a',
    "body-1-median": 'p',
    "body-2": 'p',
    "body-2-bold": 'p',
    "body-2-link": 'a',
    "body-2-median": 'p',
    "caption-bold": 'span',
    "caption-link": 'a',
    "caption-median": 'span',
    "display-1": 'h1',
    "display-2": 'h2',
    "display-wide": 'h1',
    "heading-1": 'h1',
    "heading-2": 'h2',
    "heading-3": 'h3',
    "heading-3-link": 'a',
    "heading-4": 'h4',
    "heading-4-link": 'a'
};