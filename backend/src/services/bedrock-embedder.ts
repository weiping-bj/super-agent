import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { config } from '../config/index.js';
import { createBedrockClient } from './bedrock-client.js';
import { getRegionModels } from '../config/region-models.js';

const MODEL_ID = getRegionModels().embedding;
const EMBEDDING_DIMENSION = 1024;

const bedrockClient: BedrockRuntimeClient = createBedrockClient({ region: config.aws.region });

export async function embedText(text: string): Promise<number[]> {
  return embedSingle(text, 'search_document');
}

export async function embedQuery(text: string): Promise<number[]> {
  return embedSingle(text, 'search_query');
}

async function embedSingle(
  text: string,
  inputType: 'search_document' | 'search_query',
): Promise<number[]> {
  const body = {
    texts: [text.slice(0, 2048)],
    input_type: inputType,
    embedding_types: ['float'],
    truncate: 'END',
  };

  const command = new InvokeModelCommand({
    modelId: MODEL_ID,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(body),
  });

  const response = await bedrockClient.send(command);
  const result = JSON.parse(new TextDecoder().decode(response.body));

  const embedding: number[] | undefined = result?.embeddings?.float?.[0];
  if (!embedding || embedding.length !== EMBEDDING_DIMENSION) {
    throw new Error(
      `Unexpected embedding response: got ${embedding?.length ?? 0} dims, expected ${EMBEDDING_DIMENSION}`,
    );
  }

  return embedding;
}

export { EMBEDDING_DIMENSION };
