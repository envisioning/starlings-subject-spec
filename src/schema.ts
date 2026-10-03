import { z } from 'zod';
import { DOOR_KINDS, ID_DOOR_KINDS } from '@starlings/subject-spec/doors';
import { SUBJECT_KINDS } from '@starlings/subject-spec/kinds';

/**
 * The records of the Starlings Subject Spec as zod schemas. The published JSON
 * Schema (`/spec/schema.json`) is generated from `STANDARD_SCHEMAS` at build
 * time, so the spec cannot say something this file does not.
 *
 * A product's wire shape may carry more fields than a record here. It must
 * carry every field, with the same type: Starlings checks its decision with
 * a compile-time assertion against this schema.
 */

export const subjectKindSchema = z.enum(SUBJECT_KINDS).describe('One of the subject kinds.');

export const doorKindSchema = z.enum(DOOR_KINDS).describe('What a door names.');

/** The door grammar `parseDoor` reads, as a pattern a JSON Schema validator can check. */
export const DOOR_PATTERN = new RegExp(`^(?:subject:(?:${SUBJECT_KINDS.join('|')}):.+|(?:${ID_DOOR_KINDS.join('|')}):.+)$`, 'u');

export const doorSchema = z.string()
  .regex(DOOR_PATTERN, 'A door is `<kind>:<id>`, or `subject:<subject kind>:<id>`.')
  .describe('The stable address of a thing: `<kind>:<id>`, or `subject:<subject kind>:<id>` for a subject.');

export const DECISION_SOURCES = ['message', 'meeting', 'manual', 'agent'] as const;
export const decisionSourceSchema = z.enum(DECISION_SOURCES)
  .describe('Where the decision was made: a message, a meeting, by hand, or by an agent acting for a person.');

export const DECISION_BODY_MAX_CHARS = 2_000;

/** A settled choice on one subject. Written once; a later decision that names it replaces it. */
export const decisionSchema = z.object({
  id: z.string().describe('Stable id of the decision.'),
  subject_kind: subjectKindSchema,
  subject_id: z.string().describe('Id of the subject the decision belongs to.'),
  body: z.string().max(DECISION_BODY_MAX_CHARS).describe('What was chosen, in one to a few sentences.'),
  source: decisionSourceSchema,
  source_ref: z.string().nullable().describe('The message id, the meeting id, or the agent, by `source`. Null for `manual`.'),
  goal_id: z.string().nullable().describe('The goal the decision serves, if any.'),
  decided_by_name: z.string().nullable().describe('Display name of the person who decided.'),
  decided_by_email: z.string().nullable().describe('Address of the person who decided.'),
  decided_at: z.string().describe('When it was decided, as an ISO 8601 timestamp.'),
}).describe('A settled choice on one subject.');
export type Decision = z.infer<typeof decisionSchema>;

/** Every schema the spec publishes, by the name `$defs` gives it. */
export const STANDARD_SCHEMAS = {
  SubjectKind: subjectKindSchema,
  DoorKind: doorKindSchema,
  Door: doorSchema,
  DecisionSource: decisionSourceSchema,
  Decision: decisionSchema,
} as const;

/**
 * The published JSON Schema document: one `$defs` entry per name in
 * `STANDARD_SCHEMAS`, under the spec version. `/spec/schema.json` is this.
 */
export function standardJsonSchema(id: string, version: string): Record<string, unknown> {
  const registry = z.registry<{ id: string }>();
  for (const [name, schema] of Object.entries(STANDARD_SCHEMAS)) registry.add(schema, { id: name });
  const { schemas } = z.toJSONSchema(registry, { uri: (name) => `#/$defs/${name}` });
  const defs = Object.fromEntries(Object.entries(schemas).map(([name, schema]) => {
    const { $schema: _schema, $id: _id, ...rest } = schema as Record<string, unknown>;
    return [name, rest];
  }));
  return { $schema: 'https://json-schema.org/draft/2020-12/schema', $id: id, title: 'Starlings Subject Spec', version, $defs: defs };
}
