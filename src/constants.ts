import { OpenCustomWidgetOptions } from '@contentful/app-sdk';
import { Pagination } from '@contentful/ecommerce-app-base';
import logo from './app-logo.svg';
import { SkuTypeIds } from './types';

export const DIALOG_ID = 'sku-picker-root';
export const ITEMS_OFFSET = 100;
export const SALEOR_COLOR = '#3a3944';

export const defaultPagination: Pagination = {
  offset: ITEMS_OFFSET,
  count: ITEMS_OFFSET,
  limit: ITEMS_OFFSET,
  total: 0,
  hasNextPage: false
};

export const skuTypes = [
  {
    id: SkuTypeIds.Category,
    name: 'Categories',
  },
  {
    id: SkuTypeIds.Collection,
    name: 'Collections',
  },
  {
    id: SkuTypeIds.Product,
    name: 'Products',
  },
  {
    id: SkuTypeIds.Variant,
    name: 'Variants',
  },
];

export const strings = {
  items: {
    prefix: "an",
    single: "item",
    multiple: "items",
  },
  categories: {
    prefix: "a",
    single: "category",
    multiple: "categories",
  },
  collections: {
    prefix: "a",
    single: "collection",
    multiple: "collections",
  },
  products: {
    prefix: "a",
    single: "product",
    multiple: "products",
  },
  variants: {
    prefix: "a",
    single: "variant",
    multiple: "variants",
  },
};

export const SKUPickerConfig = {
  name: 'Saleor',
  logo,
  description: 'The Saleor app allows you to attatch products from your Saleor store',
  parameterDefinitions: [
    {
      id: 'apiEndpoint',
      name: 'Store API URL',
      description: 'The url to your store API',
      type: 'Symbol',
      required: true
    },
    {
      id: "apiToken",
      name: "Saleor Access Token",
      description: "The access token to your Saleor store. Can be obtained by creating a new App through Configuration -> Webhooks & Events -> Create App. Requires \"Manage products\" permission.",
      type: "Symbol",
      required: true
    },
    {
      id: "enableChannelFilter",
      name: "Enable Channel Filter",
      description: "When enabled the channel filter will show up in the picker.",
      type: "Symbol",
      default: "true",
      required: true
    },
  ],
  color: ''
};

export const dialogConfig: Omit<OpenCustomWidgetOptions, 'id'> = {
  allowHeightOverflow: true,
  position: 'center',
  shouldCloseOnOverlayClick: true,
  shouldCloseOnEscapePress: true,
  width: 1400
};
