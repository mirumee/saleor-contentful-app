import groupBy from 'lodash/groupBy';

import { SkuTypeId, ParsedSKU } from './types';

export const getFormattedIds = (ids?: string[]) =>
  !!ids && ids?.length > 0
    ? `[${ids.map((id) => `"${id}"`).join(', ')}]`
    : '[]';

export const parseSKUs = (skus: string[]): ParsedSKU[] =>
  skus.map((sku: string) => JSON.parse(sku));

export const filterSKUsByType = (skus: ParsedSKU[], skuTypeId: SkuTypeId): ParsedSKU[] =>
  skus.filter((sku: ParsedSKU) => sku.Type === skuTypeId);

const getChannelFromSKU = (sku: ParsedSKU): string => sku.Channel;

export const groupSKUsByChannel = (
  skus: ParsedSKU[]
): Record<string, ParsedSKU[]> => groupBy(skus, getChannelFromSKU);
