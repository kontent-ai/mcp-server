import z from "zod";

// Reference by id, codename, or external_id (id preferred)
export const referenceObjectSchema = z.object({
  id: z.string().optional(),
  codename: z.string().optional(),
  external_id: z.string().optional(),
});
