/**
 * Chat Widget type definitions
 * Extracted from ChatWidget.tsx for modularity and testability.
 */

export type FlowPhase =
  | 'welcome'
  | 'ringkasan'
  | 'faq'
  | 'collecting'
  | 'confirming'
  | 'filter1_result'
  | 'filter2_pref'
  | 'detail'
  | 'done'
  | 'closing';
export type MessageWithoutId = Omit<Message, 'id'>;

export type FaqView = 'none' | 'categories' | 'items' | 'answer';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface QuickReply {
  label: string;
  value: string;
}

export interface PreferenceOption {
  id: string;
  label: string;
  criterionId: string;
}

export interface StoredUserData {
  name: string;
  gender: 'laki' | 'perempuan';
  lastParams?: Record<string, unknown>;
}
