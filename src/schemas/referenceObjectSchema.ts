import z from "zod";

/**
 * Reference to an existing entity for read-only tool inputs — ID only.
 * Read tools never accept codename (or external_id) so the agent is forced to
 * resolve an entity's ID via a list/get tool first instead of guessing a codename.
 * Field names (id) are self-descriptive — callers should describe what the
 * reference points to (e.g. "Reference to the language...") at each usage site
 * rather than repeating a generic description here.
 */
export const readReferenceObjectSchema = z.object({
  id: z.string(),
});

/**
 * Reference to an entity for write tool inputs (create/update/patch) — ID
 * (an existing entity) or external_id (e.g. an entity defined earlier in the
 * same request, or owned by an external system, that has no ID yet). Codename
 * is intentionally not accepted: by the time a caller needs to reference an
 * entity, it will already have looked up that entity's ID via a list/get tool.
 * Field names (id, external_id) are self-descriptive — callers should describe
 * what the reference points to at each usage site instead of repeating a
 * generic description here.
 */
export const writeReferenceObjectSchema = z.object({
  id: z.string().optional(),
  external_id: z.string().optional(),
});
