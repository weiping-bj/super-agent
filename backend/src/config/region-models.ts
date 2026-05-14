import { config } from './index.js';

export interface RegionModelConfig {
  claudeSonnet45: string;
  claudeSonnet46: string;
  claudeOpus45: string;
  claudeOpus46: string;
  claudeHaiku45: string;
  claude35Haiku: string | null;

  nova2Lite: string;

  novaPro: string;
  novaLite: string;
  deepseek: string | null;

  embedding: string;
}

const REGION_MODELS: Record<string, RegionModelConfig> = {
  'us-east-1': {
    claudeSonnet45: 'us.anthropic.claude-sonnet-4-5-20250929-v1:0',
    claudeSonnet46: 'us.anthropic.claude-sonnet-4-6',
    claudeOpus45: 'us.anthropic.claude-opus-4-5-20251101-v1:0',
    claudeOpus46: 'us.anthropic.claude-opus-4-6-v1',
    claudeHaiku45: 'us.anthropic.claude-haiku-4-5-20251001-v1:0',
    claude35Haiku: 'us.anthropic.claude-3-5-haiku-20241022-v1:0',
    nova2Lite: 'us.amazon.nova-2-lite-v1:0',
    novaPro: 'us.amazon.nova-pro-v1:0',
    novaLite: 'us.amazon.nova-lite-v1:0',
    deepseek: 'deepseek.deepseek-v3-0324-v1:0',
    embedding: 'us.cohere.embed-v4:0',
  },
  'us-west-2': {
    claudeSonnet45: 'us.anthropic.claude-sonnet-4-5-20250929-v1:0',
    claudeSonnet46: 'us.anthropic.claude-sonnet-4-6',
    claudeOpus45: 'us.anthropic.claude-opus-4-5-20251101-v1:0',
    claudeOpus46: 'us.anthropic.claude-opus-4-6-v1',
    claudeHaiku45: 'us.anthropic.claude-haiku-4-5-20251001-v1:0',
    claude35Haiku: 'us.anthropic.claude-3-5-haiku-20241022-v1:0',
    nova2Lite: 'us.amazon.nova-2-lite-v1:0',
    novaPro: 'us.amazon.nova-pro-v1:0',
    novaLite: 'us.amazon.nova-lite-v1:0',
    deepseek: 'deepseek.deepseek-v3-0324-v1:0',
    embedding: 'us.cohere.embed-v4:0',
  },
  'ap-northeast-1': {
    claudeSonnet45: 'jp.anthropic.claude-sonnet-4-5-20250929-v1:0',
    claudeSonnet46: 'jp.anthropic.claude-sonnet-4-6',
    claudeOpus45: 'global.anthropic.claude-opus-4-5-20251101-v1:0',
    claudeOpus46: 'global.anthropic.claude-opus-4-6-v1',
    claudeHaiku45: 'jp.anthropic.claude-haiku-4-5-20251001-v1:0',
    claude35Haiku: null,
    nova2Lite: 'jp.amazon.nova-2-lite-v1:0',
    novaPro: 'apac.amazon.nova-pro-v1:0',
    novaLite: 'apac.amazon.nova-lite-v1:0',
    deepseek: null,
    embedding: 'global.cohere.embed-v4:0',
  },
};

export function getRegionModels(): RegionModelConfig {
  const models = REGION_MODELS[config.aws.region];
  if (!models) {
    throw new Error(
      `Unsupported AWS_REGION "${config.aws.region}". Supported regions: ${Object.keys(REGION_MODELS).join(', ')}`,
    );
  }
  return models;
}
