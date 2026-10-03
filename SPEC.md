# Starlings Subject Spec

A **subject** is one thing a company works on: a project, a lead, a partner
or an event. It holds its own history across time. Tools and agents that
share the subject share the context. This spec defines the subject kinds,
the doors that address things, and the records an agent reads and writes.

Starlings is the reference implementation. Any tool may implement this spec
without permission. The licence is Apache-2.0.

## Status

Version 0.1.0. This is a first draft. It names the kinds, the doors and one
record, the decision, and has a conformance suite for them. Other records
follow: the subject itself, the task, the goal, the meeting record and the
act record: a signed, append-only log of what each person and agent did.

## Subject kinds

| Kind | What it is |
| --- | --- |
| `project` | Work the company delivers, usually for a client |
| `lead` | A possible piece of work, before it is won or lost |
| `partner` | An organization the company works with over time |
| `event` | A dated gathering the company runs or attends |

What each kind can receive (tasks, documents, issues, meetings) is the
implementation's decision. The spec does not require one kind to hold tasks
and another not to.

## Doors

A **door** is the stable address of a thing. An agent passes doors between
tools instead of names.

- A subject: `subject:<kind>:<id>`, for example `subject:lead:7f3a…`.
- Any other thing: `<kind>:<id>`, where the kind is one of `person`,
  `agent`, `thread`, `document`, `event`, `task` or `issue`.

The id is opaque. It may contain `:`. Only the first colon (and, for a
subject, the second) is part of the grammar. A person or an agent is named by
an address, for example `person:ada@example.com`.

An implementation may define more doors for its own places and actions.
Those doors are not part of the standard, and an agent must not expect
another implementation to read them.

## Records

### Decision

A settled choice on one subject. An implementation writes a decision once
and does not edit it. To change a decision, it records a new decision whose
body names the old one.

The fields are in the schema below. An implementation may add fields. It must
keep every field the spec names, with the same type.

## Conformance

An implementation conforms when it passes every case in the conformance
suite for the spec version it claims. The cases are one JSON file,
`/spec/conformance/cases.json`. The file is the contract: an implementation in
any language reads it and runs the rules below.

| Section | Rule |
| --- | --- |
| `subjectKinds` | The implementation knows exactly these kinds |
| `doors.valid` | Reading `door` gives `parsed`, and writing `parsed` gives `door` back |
| `doors.invalid` | Reading the door gives nothing |
| `doors.productOnly` | The door may be read by the product that defines it, but never as one of the `doorKinds` |
| `decisions.valid` | The record is a valid decision. An extra field does not make it invalid |
| `decisions.invalid` | The record is not a valid decision. A case with `bodyLength` sets `body` to that many characters first |

For a JavaScript or TypeScript implementation, `/spec/conformance/run.mjs`
runs the cases with no dependencies. Write an adapter module that exports
`subjectKinds`, `parseDoor`, `doorString` and, optionally,
`validateDecision`, then run `node run.mjs ./adapter.mjs`. The reference
implementation's adapter is `/spec/conformance/reference-adapter.mjs`.

## Versions

The version is `MAJOR.MINOR.PATCH`.

- A **patch** changes wording only.
- A **minor** version adds a record, a field, a kind or a door kind. A
  reader that does not know the addition ignores it.
- A **major** version removes or changes something. One major version is
  current at a time, and the spec announces a major change before it ships.

## Schema

The JSON Schema (draft 2020-12) is generated from the reference
implementation's code, so it cannot disagree with it. Download it at
`/spec/schema.json`.
