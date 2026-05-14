/**
 * Claude Code SDK configuration utilities.
 *
 * Provides Bedrock model ID mapping and credential validation
 * for the Claude Agent SDK integration.
 */

import { getRegionModels } from '../config/region-models.js';

/**
 * Maps Anthropic model identifiers to their corresponding
 * AWS Bedrock model ARN-style IDs.
 */
const models = getRegionModels();
export const ANTHROPIC_TO_BEDROCK_MODEL_MAP: Record<string, string> = {
  'claude-sonnet-4-5-20250929': models.claudeSonnet45,
  'claude-haiku-4-5-20251001': models.claudeHaiku45,
  'claude-sonnet-4-6': models.claudeSonnet46,
  'claude-opus-4-6': models.claudeOpus46,
};

/**
 * Returns the Bedrock model ID for a given Anthropic model identifier.
 * If the model is not found in the mapping, the original ID is returned unchanged.
 *
 * @param anthropicModelId - The Anthropic model identifier (e.g. 'claude-sonnet-4-5-20250929')
 * @returns The corresponding Bedrock model ID, or the original ID if no mapping exists
 */
export function getBedrockModelId(anthropicModelId: string): string {
  return ANTHROPIC_TO_BEDROCK_MODEL_MAP[anthropicModelId] ?? anthropicModelId;
}

/**
 * Credential configuration for Claude Agent SDK.
 */
export interface ClaudeCredentialConfig {
  anthropicApiKey?: string;
  claudeCodeUseBedrock?: string;
  /**
   * Bedrock API Key (bearer token). When set together with
   * `claudeCodeUseBedrock === 'true'` and a non-empty `awsRegion`, this
   * alone is sufficient — no AK/SK needed.
   */
  bedrockApiKey?: string;
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  awsRegion?: string;
}

/**
 * Validates that either Anthropic API key or valid AWS Bedrock credentials are present.
 *
 * Validation passes if:
 * - ANTHROPIC_API_KEY is a non-empty string, OR
 * - CLAUDE_CODE_USE_BEDROCK is "true"/"1" AND ONE of the following credential
 *   sets is complete:
 *     a) `bedrockApiKey` is a non-empty string AND `awsRegion` is non-empty, OR
 *     b) `awsAccessKeyId`, `awsSecretAccessKey`, and `awsRegion` are all non-empty.
 *
 * @param config - The credential configuration to validate
 * @returns An object with `valid` boolean and optional `error` message
 */
export function validateClaudeCredentials(config: ClaudeCredentialConfig): {
  valid: boolean;
  error?: string;
} {
  // Check if Anthropic API key is present
  if (config.anthropicApiKey && config.anthropicApiKey.trim().length > 0) {
    return { valid: true };
  }

  // Check if Bedrock credentials are present
  if (config.claudeCodeUseBedrock === 'true' || config.claudeCodeUseBedrock === '1') {
    const hasRegion =
      config.awsRegion !== undefined && config.awsRegion.trim().length > 0;
    const hasBedrockApiKey =
      config.bedrockApiKey !== undefined && config.bedrockApiKey.trim().length > 0;

    // Path A: Bedrock API Key + Region
    if (hasBedrockApiKey && hasRegion) {
      return { valid: true };
    }

    const hasAccessKeyId =
      config.awsAccessKeyId !== undefined && config.awsAccessKeyId.trim().length > 0;
    const hasSecretAccessKey =
      config.awsSecretAccessKey !== undefined && config.awsSecretAccessKey.trim().length > 0;

    // Path B: AK/SK/Region
    if (hasAccessKeyId && hasSecretAccessKey && hasRegion) {
      return { valid: true };
    }

    // Neither path is complete — build a helpful error message
    if (hasBedrockApiKey && !hasRegion) {
      return {
        valid: false,
        error: 'CLAUDE_CODE_USE_BEDROCK is enabled with BEDROCK_API_KEY but AWS_REGION is missing',
      };
    }

    const missing: string[] = [];
    if (!hasAccessKeyId) missing.push('AWS_ACCESS_KEY_ID');
    if (!hasSecretAccessKey) missing.push('AWS_SECRET_ACCESS_KEY');
    if (!hasRegion) missing.push('AWS_REGION');

    return {
      valid: false,
      error: `CLAUDE_CODE_USE_BEDROCK is enabled but missing required AWS credentials: ${missing.join(', ')} (or set BEDROCK_API_KEY + AWS_REGION instead)`,
    };
  }

  return {
    valid: false,
    error:
      'Either ANTHROPIC_API_KEY must be set, or CLAUDE_CODE_USE_BEDROCK must be "true" with valid AWS credentials (BEDROCK_API_KEY + AWS_REGION, or AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY + AWS_REGION)',
  };
}
