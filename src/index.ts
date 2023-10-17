import { DialogExtensionSDK, FieldExtensionSDK } from '@contentful/app-sdk';
import { dialogConfig, DIALOG_ID, SKUPickerConfig, strings, skuTypes } from './constants';

import { renderSkuPicker } from './Picker/renderSkuPicker';
import PaginatedFetcher from './PaginatedFetcher';
import { ClientConfig, SkuTypeId, SkuTypeIds } from './types';
import { customSetup } from './setup';

const getSkuTypeStrings = (skuTypeId?: string) => {
  switch (skuTypeId) {
    case SkuTypeIds.Category:
      return strings.categories;
    case SkuTypeIds.Collection:
      return strings.collections;
    case SkuTypeIds.Product:
      return strings.products;
    case SkuTypeIds.Variant:
      return strings.variants;
    default:
      return strings.items;
  }
}

const makeCTA = (fieldType: string, skuTypeIds: string[]) => {
  const skuTypeStrings = skuTypeIds && skuTypeIds.length === 1 ? getSkuTypeStrings(skuTypeIds[0]) : getSkuTypeStrings();
  const prefix = skuTypeStrings.prefix || 'a';
  return fieldType === 'Array' ? `Select ${skuTypeStrings.multiple}` : `Select ${prefix} ${skuTypeStrings.single}`;
};

const makeSaveBtnText = (selectedSKUs: string[], skuTypeIds?: string[]) => {
  const skuTypeStrings = skuTypeIds && skuTypeIds.length === 1 ? getSkuTypeStrings(skuTypeIds[0]) : getSkuTypeStrings();
  switch (selectedSKUs.length) {
    case 0:
      return `Save ${skuTypeStrings.multiple}`;
    case 1:
      return `Save 1 ${skuTypeStrings.single}`;
    default:
      return `Save ${selectedSKUs.length} ${skuTypeStrings.multiple}`;
  }
}

const validateParameters = (parameters: ClientConfig): string | null => {
  if (parameters.apiEndpoint.length < 1) {
    return 'Missing API Endpoint';
  }
  if (parameters.apiToken.length < 1) {
    return 'Missing API Token';
  }

  return null;
};

const createContainer = () => {
  const container = document.createElement('div');
  container.id = DIALOG_ID;
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  document.body.appendChild(container);
};

const renderDialog = async (sdk: DialogExtensionSDK) => {
  createContainer();
  const fetcher = new PaginatedFetcher(sdk.parameters.installation as ClientConfig);
  // @ts-expect-error
  const fieldSkuTypeIds = sdk.parameters.invocation.skuType as SkuTypeId[];

  renderSkuPicker(DIALOG_ID, {
    sdk,
    fieldSkuTypeIds,
    // @ts-expect-error Incompatible types
    makeSaveBtnText,
    fetchProductPreviews: fetcher.getItemsBySKUs,
    fetchProducts: fetcher.getItems,
    fetchChannels: fetcher.getChannels,
  });

  sdk.window.startAutoResizer();
};

const openDialog = async (sdk: FieldExtensionSDK, currentValue: any, parameters: ClientConfig) => {
  // @ts-expect-error
  const fieldSkuTypeIds = parameters.skuType as SkuTypeId[];
  const skus = await sdk.dialogs.openCurrentApp({
    title: makeCTA(sdk.field.type, fieldSkuTypeIds),
    // @ts-expect-error Incompatible types
    parameters: {
      ...parameters,
      fieldValidations: sdk.field.validations,
    },
    ...dialogConfig,
  });

  return Array.isArray(skus) ? skus : [];
};

const fetchProductPreviews = (skus: string[], config: ClientConfig) =>
  new PaginatedFetcher(config).getItemsBySKUs(skus);

const config = {
  ...SKUPickerConfig,
  makeCTA,
  isDisabled: () => false,
  fetchProductPreviews,
  renderDialog,
  openDialog,
  validateParameters,
  skuTypes,
};

// @ts-ignore in order to keep ClientConfig type instead of sku apps' Record<string, string>
customSetup(config);
