# Fact component blueprint for Kontent.ai

This blueprint is for a reusable "Fact" component that editors can place in pages and articles.
It is designed for a scalable flow where AI drafts the fact and humans review/edit before publishing.

## Target use case

- Publish one "less-known fact" daily (for example, about SoundCloud).
- Keep each fact traceable to a source.
- Let editors switch visual style without rewriting content.
- Reuse the same component in page builders and article bodies.

## Recommended content type: `fact`

Create a reusable content type called `fact` with three groups of fields:

### 1) Core fact content

| Element name | Codename | Type | Required | Notes |
| --- | --- | --- | --- | --- |
| Headline | `headline` | `text` | Yes | Keep under ~120 characters. |
| Fact body | `fact_body` | `rich_text` | Yes | 1-3 short paragraphs; allow link formatting for citations. |
| Fact date | `fact_date` | `date_time` | Yes | Date tied to the fact, not publish timestamp. |
| Source name | `source_name` | `text` | Yes | Publication, study, report, etc. |
| Source URL | `source_url` | `text` | Yes | Store canonical source URL. |

### 2) Presentation (look and feel)

| Element name | Codename | Type | Required | Notes |
| --- | --- | --- | --- | --- |
| Visual variant | `visual_variant` | `multiple_choice` (single) | Yes | Main style switch used by frontend renderer. |
| Emphasis level | `emphasis_level` | `multiple_choice` (single) | No | `subtle`, `standard`, `bold`. |
| Optional icon | `icon` | `asset` | No | 0-1 icon asset for visual context. |
| CTA label | `cta_label` | `text` | No | Example: "Read the full source". |
| CTA URL | `cta_url` | `text` | No | Optional outbound CTA. |

### 3) AI + editorial governance

| Element name | Codename | Type | Required | Notes |
| --- | --- | --- | --- | --- |
| Generation method | `generation_method` | `multiple_choice` (single) | Yes | `ai_draft`, `human_written`, `hybrid`. |
| AI prompt version | `ai_prompt_version` | `text` | No | Non-localizable to track prompt template changes. |
| Review state | `review_state` | `multiple_choice` (single) | Yes | `needs_review`, `edited`, `approved`, `rejected`. |
| Reviewed by | `reviewed_by` | `text` | No | Editor or team identifier. |
| Review date | `review_date` | `date_time` | No | Set when review is completed. |
| Uniqueness key | `uniqueness_key` | `text` | No | Used to avoid repeating facts in automation. |

## Visual variant options to include

Start with these six variants for flexibility across pages and articles:

1. **Clean strip** (`clean_strip`)
   - Slim inline bar, best for article body interruptions.
2. **Editorial card** (`editorial_card`)
   - Balanced card with title, body, and source; good default.
3. **Data tile** (`data_tile`)
   - Big numeric or short statement emphasis for dashboards/landing pages.
4. **Myth vs fact** (`myth_fact`)
   - Two-column contrast block, ideal for clarifications.
5. **Timeline moment** (`timeline_moment`)
   - Date-forward layout for historical/chronological storytelling.
6. **Quote spotlight** (`quote_spotlight`)
   - Pull-quote style layout with strong typography.

## Frontend rendering recommendation

Render by `visual_variant` with a fallback to `editorial_card`.
This gives editors freedom while keeping one canonical content model.

```ts
const variant = fact.visual_variant ?? "editorial_card";
return renderers[variant]?.(fact) ?? renderers.editorial_card(fact);
```

## Make it reusable on pages and articles

1. In `page` and `article` content types, use a `modular_content` element (for example `content_blocks`).
2. Allow the `fact` content type in `allowed_content_types`.
3. If article body uses rich text components, include `fact` in rich text `allowed_content_types` as well.

## Example payload for `add-content-type-mapi`

Use this as a starting payload to create the `fact` content type:

```json
{
  "name": "Fact",
  "codename": "fact",
  "elements": [
    {
      "type": "text",
      "name": "Headline",
      "codename": "headline",
      "is_required": true,
      "maximum_text_length": {
        "value": 120,
        "applies_to": "characters"
      }
    },
    {
      "type": "rich_text",
      "name": "Fact body",
      "codename": "fact_body",
      "is_required": true,
      "allowed_blocks": ["text", "components-and-items"],
      "allowed_formatting": ["bold", "italic", "link"],
      "allowed_text_blocks": ["paragraph", "unordered-list"]
    },
    {
      "type": "date_time",
      "name": "Fact date",
      "codename": "fact_date",
      "is_required": true
    },
    {
      "type": "text",
      "name": "Source name",
      "codename": "source_name",
      "is_required": true
    },
    {
      "type": "text",
      "name": "Source URL",
      "codename": "source_url",
      "is_required": true,
      "validation_regex": {
        "is_active": true,
        "regex": "^https://.+",
        "validation_message": "Use a secure https URL."
      }
    },
    {
      "type": "multiple_choice",
      "name": "Visual variant",
      "codename": "visual_variant",
      "mode": "single",
      "is_required": true,
      "options": [
        { "name": "Clean strip", "codename": "clean_strip" },
        { "name": "Editorial card", "codename": "editorial_card" },
        { "name": "Data tile", "codename": "data_tile" },
        { "name": "Myth vs fact", "codename": "myth_fact" },
        { "name": "Timeline moment", "codename": "timeline_moment" },
        { "name": "Quote spotlight", "codename": "quote_spotlight" }
      ]
    },
    {
      "type": "multiple_choice",
      "name": "Review state",
      "codename": "review_state",
      "mode": "single",
      "is_required": true,
      "options": [
        { "name": "Needs review", "codename": "needs_review" },
        { "name": "Edited", "codename": "edited" },
        { "name": "Approved", "codename": "approved" },
        { "name": "Rejected", "codename": "rejected" }
      ]
    }
  ]
}
```

## Daily AI to human pipeline

1. Generate a daily fact draft (AI) with source URL + source name required.
2. Save as a variant with `review_state = needs_review`.
3. Human editor checks factual accuracy, rewrites for brand voice, and sets:
   - `review_state = approved`
   - `reviewed_by`
   - `review_date`
4. Publish only approved variants.
5. Use `uniqueness_key` in automation to reduce duplicate daily facts.
