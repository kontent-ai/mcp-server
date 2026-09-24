import { z } from "zod";

export const environmentIdSchema = z
  .guid()
  .optional()
  .describe(
    "Kontent.ai environment ID (GUID) to operate on. Optional only when the server has a default configured via the KONTENT_ENVIRONMENT_ID environment variable (single-tenant/STDIO mode); otherwise required.",
  );
