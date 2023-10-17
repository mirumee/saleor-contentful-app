import { Product } from '@contentful/ecommerce-app-base';

import {
  CategoriesData,
  CollectionsData,
  VariantsData,
  ProductsData,
  SkuTypeIds,
  ParsedSKU,
} from './types';

const getSerializedSKU = (id: string, type: string, channel: string) =>
  JSON.stringify({ID: id, Type: type, Channel: channel} as ParsedSKU);

export const mapCategoriesToContentfulProducts = (
  categories: CategoriesData,
  channel: string
): Product[] => {
  return categories.edges.map((category) => ({
    sku: getSerializedSKU(category.node.id, SkuTypeIds.Category, channel),
    displaySKU: `Category ID: ${category.node.id}`,
    image: category.node.backgroundImage?.url || '',
    id: category.node.id,
    name: category.node.name,
  }));
};

export const mapCollectionsToContentfulProducts = (
  collections: CollectionsData,
  channel: string
): Product[] => {
  return collections.edges.map((collection) => ({
    sku: getSerializedSKU(collection.node.id, SkuTypeIds.Collection, channel),
    displaySKU: `Collection ID: ${collection.node.id}`,
    image: collection.node.backgroundImage?.url || '',
    id: collection.node.id,
    name: collection.node.name,
  }));
};

export const mapProductsToContentfulProducts = (
  products: ProductsData,
  channel: string
): Product[] => {
  return products.edges.map((product) => ({
    sku: getSerializedSKU(product.node.id, SkuTypeIds.Product, channel),
    displaySKU: `Product ID: ${product.node.id}`,
    image: product.node.images[0]?.url || '',
    id: product.node.id,
    name: product.node.name,
  }));
};

export const mapVariantsToContentfulProducts = (
  categories: VariantsData,
  channel: string
): Product[] => {
  return categories.edges.map((variant) => ({
    sku: getSerializedSKU(variant.node.id, SkuTypeIds.Variant, channel),
    displaySKU: `Variant ID: ${variant.node.id}`,
    image: variant.node.media[0]?.url || '',
    id: variant.node.id,
    name: variant.node.name,
  }));
};
