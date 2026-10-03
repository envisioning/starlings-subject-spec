/**
 * The subject kinds. A subject is one thing a company works on, holding its
 * own history across time. Zod-free, so a browser entry pays nothing for it.
 *
 * What each kind can receive in a given product (tasks, issues, documents,
 * meetings) is that product's decision, not the standard's.
 */

export const SUBJECT_KINDS = ['project', 'lead', 'partner', 'event'] as const;
export type SubjectKind = (typeof SUBJECT_KINDS)[number];

export function isSubjectKind(value: unknown): value is SubjectKind {
  return typeof value === 'string' && (SUBJECT_KINDS as readonly string[]).includes(value);
}
