# MCP Server Context Optimization Proposal

## Executive Summary

This document provides a comprehensive review of the MCP server's context optimization efforts and presents actionable recommendations for improvements. Based on the analysis, the current baseline implementation uses **33,126 tokens**, with significant potential to achieve the target of **< 30,000 tokens** and beyond.

---

## Current State Analysis

### 🎯 Current Baseline

1. **Context Measurement Tool Implementation**
   - New `measure-context.ts` tool provides accurate token counting using tiktoken
   - Supports detailed analysis, JSON output, baseline comparison
   - Integrated into npm scripts for easy access
   - Provides actionable metrics per tool

2. **Starting Metrics**
   - **Baseline context size**: **33,126 tokens**
   - Average tokens per tool: **1,142** (29 tools total)
   - Token/Character ratio: **0.16** (efficient encoding)
   - **Target**: < 30,000 tokens (10% reduction minimum)

### ⚠️ Critical Issues Identified

#### 1. **Schema Description Bloat** (HIGHEST PRIORITY)
The top 3 tools consume **24,107 tokens** (73% of total):
- `patch-content-type-mapi`: **11,460 tokens** (35 desc, 11,425 schema)
- `add-content-type-mapi`: **7,200 tokens** (10 desc, 7,190 schema)
- `add-content-type-snippet-mapi`: **5,447 tokens** (11 desc, 5,436 schema)

**Root Cause**: Excessive inline documentation in Zod `.describe()` methods

#### 2. **Duplicated Documentation**
The `patch-content-type-mapi` tool contains a 48-line description (lines 15-62) embedded in the schema:
- Rich text element properties (12 lines)
- Operation types (5 lines)
- Path formats (8 lines)
- Special techniques (3 lines)
- Best practices (9 lines)

This documentation belongs in external files or simplified inline.

#### 3. **Verbose Tool Descriptions**
Some tools have unnecessarily long descriptions:
- `search-variants-mapi`: **434 tokens** just for description
- `filter-variants-mapi`: **192 tokens** for description

---

## Optimization Recommendations

### 🔴 Priority 1: Schema Description Optimization (Estimated Savings: 15,000-18,000 tokens)

#### Action Items:

1. **Extract Detailed Documentation**
   ```typescript
   // BEFORE (11,425 tokens)
   operations: patchOperationsSchema.describe(
     `Array of patch operations... [48 lines of text]`
   )

   // AFTER (~500 tokens)
   operations: patchOperationsSchema.describe(
     "JSON Patch operations (move/addInto/remove/replace). See PATCH_OPERATIONS.md"
   )
   ```

2. **Create Reference Documentation Files**
   - `docs/PATCH_OPERATIONS.md` - Detailed patch operation guide
   - `docs/RICH_TEXT_PROPERTIES.md` - Rich text element configuration
   - `docs/ELEMENT_TYPES.md` - Element type specifications
   - Keep these OUT of context, reference them in tool descriptions

3. **Simplify Element Schemas**
   ```typescript
   // BEFORE
   .describe("An object with an id or codename property referencing another item. Using id is preferred for better performance.")

   // AFTER
   .describe("Reference by id or codename")
   ```

### 🟠 Priority 2: Tool Description Optimization (Estimated Savings: 1,500-2,000 tokens)

#### Current Pattern Issues:
```typescript
// Verbose (40+ chars)
"Get Kontent.ai content type by internal ID from Management API"

// Optimized (20-25 chars)
"Get content type (MAPI)"
```

#### Proposed Naming Convention:
- Remove redundant "Kontent.ai" from descriptions (implied by server context)
- Use abbreviations: MAPI/DAPI instead of "Management API"/"Delivery API"
- Focus on action + entity only

#### Examples:
| Current | Proposed | Savings |
|---------|----------|---------|
| "Update an existing Kontent.ai content type by codename via Management API. Supports move, addInto, remove, and replace operations following RFC 6902 JSON Patch specification." | "Patch content type (MAPI)" | ~140 chars |
| "Get Kontent.ai content item by ID or external ID from Management API" | "Get content item (MAPI)" | ~45 chars |

### 🟡 Priority 3: Schema Structure Optimization (Estimated Savings: 2,000-3,000 tokens)

1. **Create Shared Schema Components**
   ```typescript
   // Define once
   const commonElementProps = {
     codename: z.string().optional().describe("Codename"),
     external_id: z.string().optional().describe("External ID"),
   };

   // Reuse everywhere
   const assetElement = z.object({
     ...commonElementProps,
     type: z.literal("asset"),
     // specific props
   });
   ```

2. **Use Schema References**
   Instead of duplicating complex schemas, use references:
   ```typescript
   // Define once in shared schemas
   export const contentTypeSchema = z.object({...});

   // Reference in tools
   input: z.object({
     contentType: contentTypeSchema
   })
   ```

3. **Remove Optional Descriptions**
   For self-explanatory fields, skip `.describe()`:
   ```typescript
   // BEFORE
   name: z.string().describe("Display name of the content type")

   // AFTER
   name: z.string() // Self-explanatory
   ```

### 🟢 Priority 4: Tool Consolidation (Estimated Savings: 1,000-1,500 tokens)

Consider merging similar operations:
- Combine `get-item-mapi`, `get-asset-mapi`, `get-type-mapi` → `get-entity-mapi` with entity type parameter
- Merge list operations → `list-entities-mapi` with entity type parameter

---

## Implementation Plan

### Phase 1: Quick Wins (1-2 hours)
1. ✅ Baseline current state: `npm run measure-context:baseline`
2. 📝 Simplify all tool descriptions (remove "Kontent.ai", use MAPI/DAPI)
3. 📝 Remove redundant `.describe()` calls on obvious fields
4. 🔄 Test: `npm run measure-context:compare`
5. **Expected reduction: 2,000-3,000 tokens**

### Phase 2: Schema Refactoring (2-4 hours)
1. 📝 Extract verbose descriptions from `patch-content-type-mapi`
2. 📝 Create external documentation files
3. 📝 Simplify all element schema descriptions
4. 📝 Create shared schema components
5. 🔄 Test and validate functionality
6. **Expected reduction: 10,000-12,000 tokens**

### Phase 3: Structural Optimization (4-6 hours)
1. 🔨 Refactor schemas to use references
2. 🔨 Consolidate similar tools
3. 🔨 Implement dynamic schema loading (if applicable)
4. 🔄 Full regression testing
5. **Expected reduction: 3,000-4,000 tokens**

---

## Success Metrics

### Primary Goals
- ✅ **Target**: < 30,000 tokens (currently 33,126)
- ✅ **Minimum**: 15% reduction from current (< 28,157 tokens)
- ✅ **Stretch**: < 25,000 tokens

### Monitoring
```bash
# Track progress
npm run measure-context:baseline  # Before changes
# ... make changes ...
npm run measure-context:compare   # After changes

# CI/CD Integration
npm run measure-context           # Fails if > 35,000 tokens
```

---

## Risk Mitigation

### Potential Risks
1. **Loss of Context**: Removing too much description might confuse AI
   - **Mitigation**: Test with actual use cases after each phase
   - Keep essential operation details, remove redundant explanations

2. **Breaking Changes**: Schema modifications might affect existing integrations
   - **Mitigation**: Maintain backward compatibility
   - Test with MCP inspector after changes

3. **Documentation Gap**: Less inline documentation means users need external refs
   - **Mitigation**: Create comprehensive external docs
   - Add links to documentation in tool descriptions

---

## Technical Recommendations

### 1. Implement Progressive Loading
Consider implementing a two-tier system:
- **Core tools**: Loaded immediately (most used ~10 tools)
- **Extended tools**: Loaded on demand

### 2. Use Schema Compression
Implement a schema registry pattern:
```typescript
// Schema registry
const schemas = {
  'contentType': { /* full schema */ },
  'variant': { /* full schema */ }
};

// Tools reference schemas by ID
tool.inputSchema = { $ref: 'contentType' }
```

### 3. Consider Protocol Extensions
Explore MCP protocol extensions for:
- Lazy loading of tool descriptions
- Schema caching mechanisms
- Compressed schema transmission

---

## Next Steps

1. **Review and Approve** this proposal
2. **Create feature branch**: `feature/context-optimization`
3. **Implement Phase 1** (Quick Wins)
4. **Measure and validate** improvements
5. **Proceed with Phase 2** if Phase 1 successful
6. **Document changes** in CHANGELOG.md

---

## Appendix: Token Distribution Analysis

### Current Top 10 Token Consumers
| Tool | Total | Description | Schema | Optimization Potential |
|------|-------|-------------|--------|----------------------|
| patch-content-type-mapi | 11,460 | 35 | 11,425 | HIGH - Extract docs |
| add-content-type-mapi | 7,200 | 10 | 7,190 | HIGH - Simplify schemas |
| add-content-type-snippet-mapi | 5,447 | 11 | 5,436 | HIGH - Simplify schemas |
| upsert-language-variant-mapi | 2,857 | 40 | 2,817 | MEDIUM - Reduce schema |
| filter-variants-mapi | 1,652 | 192 | 1,460 | MEDIUM - Shorten desc |
| search-variants-mapi | 634 | 434 | 200 | HIGH - Shorten desc |
| unpublish-variant-mapi | 565 | 122 | 443 | LOW |
| publish-variant-mapi | 544 | 129 | 415 | LOW |
| add-content-item-mapi | 408 | 41 | 367 | LOW |
| change-variant-workflow-step-mapi | 340 | 46 | 294 | LOW |

### Projected Post-Optimization Distribution
| Category | Current | Target | Reduction |
|----------|---------|--------|-----------|
| Top 3 Tools | 24,107 | 8,000 | -66% |
| Mid-tier Tools (4-15) | 6,000 | 4,500 | -25% |
| Small Tools (16-29) | 3,019 | 2,500 | -17% |
| **TOTAL** | **33,126** | **15,000** | **-55%** |

---

## Conclusion

Starting from the current baseline of 33,126 tokens, we have identified significant optimization opportunities. By focusing on schema description extraction and simplification, we can achieve the target of < 30,000 tokens with minimal effort, and potentially reach as low as 15,000 tokens with comprehensive optimization. The proposed phased approach ensures low risk while delivering measurable improvements at each stage.

**Recommended immediate action**: Implement Phase 1 quick wins to validate the approach and demonstrate immediate value.