/**
 * FAQ Page Content — adapter for app/faq/page.tsx
 *
 * Re-exports the chatbot's FAQ_CONTENT under a page-friendly interface.
 * The chatbot's `FaqItem.answer` is a markdown string (bold/bullets/emoji);
 * the page renders it via `whitespace-pre-line` so markdown stays as-is.
 *
 * This file is the ONLY import path for the standalone FAQ page.
 * If the page needs a different shape later, we adapt here — not in the chatbot file.
 */

import { FAQ_CONTENT, FaqSection, FaqItem } from './faq-content';

// Page uses the same section type (id, title, items)
export type FaqPageSection = FaqSection;
export type FaqPageItem = FaqItem;

// Re-export with page-friendly alias
export const FAQ_PAGE_CONTENT: FaqPageSection[] = FAQ_CONTENT;
