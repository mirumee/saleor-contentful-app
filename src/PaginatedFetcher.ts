import { ClientConfig } from './types';
import { Product } from '@contentful/ecommerce-app-base';
import ApiClient from './ApiClient';
import { filterSKUsByType, groupSKUsByChannel, parseSKUs } from './utils';
import { defaultPagination } from './constants';
import { SkuTypeIds } from './types';
import {
  mapCategoriesToContentfulProducts,
  mapCollectionsToContentfulProducts,
  mapProductsToContentfulProducts,
  mapVariantsToContentfulProducts,
} from './mapping';

class PaginatedFetcher {
  apiClient: ApiClient;
  endCursor: string = '';
  lastSearch?: string;
  lastChannel?: string;
  lastSkuTypeId?: string;

  constructor({ apiEndpoint, apiToken }: ClientConfig) {
    this.apiClient = new ApiClient({ apiEndpoint, apiToken });
  }

  getItemsBySKUs = async (skus: string[]) => {
    const parsedSKUs = parseSKUs(skus);
    const categorySKUs = filterSKUsByType(parsedSKUs, SkuTypeIds.Category);
    const collectionSKUs = filterSKUsByType(parsedSKUs, SkuTypeIds.Collection);
    const productSKUs = filterSKUsByType(parsedSKUs, SkuTypeIds.Product);
    const variantSKUs = filterSKUsByType(parsedSKUs, SkuTypeIds.Variant);

    let items: Product[] = [];
    if (productSKUs.length > 0) {
      const skusByChannel = groupSKUsByChannel(productSKUs);
      for (const [channel, skus] of Object.entries(skusByChannel)) {
        const ids = skus.map((sku) => sku.ID);
        const productsData = await this.apiClient.fetchProducts({ ids, channel: '' });
        const parsedProducts = mapProductsToContentfulProducts(productsData, channel);
        items = [...items, ...parsedProducts];
      }
    }

    if (variantSKUs.length > 0) {
      const skusByChannel = groupSKUsByChannel(variantSKUs);
      for (const [channel, skus] of Object.entries(skusByChannel)) {
        const ids = skus.map((sku) => sku.ID);
        const variantsData = await this.apiClient.fetchVariants({ ids, channel: '' });
        const parsedVariants = mapVariantsToContentfulProducts(variantsData, channel);
        items = [...items, ...parsedVariants];
      }
    }

    if (categorySKUs.length > 0) {
      const skusByChannel = groupSKUsByChannel(categorySKUs);
      for (const [channel, skus] of Object.entries(skusByChannel)) {
        const ids = skus.map((sku) => sku.ID);
        const categoriesData = await this.apiClient.fetchCategories({ ids, channel: '' });
        const parsedCategories = mapCategoriesToContentfulProducts(categoriesData, channel);
        items = [...items, ...parsedCategories];
      }
    }

    if (collectionSKUs.length > 0) {
      const skusByChannel = groupSKUsByChannel(collectionSKUs);
      for (const [channel, skus] of Object.entries(skusByChannel)) {
        const ids = skus.map((sku) => sku.ID);
        const categoriesData = await this.apiClient.fetchCollections({ ids, channel: '' });
        const parsedCollections = mapCollectionsToContentfulProducts(categoriesData, channel);
        items = [...items, ...parsedCollections];
      }
    }

    return items;
  };

  getCategories = async (search: string, channel: string) => {
    const categoriesData = await this.apiClient.fetchCategories({
      search,
      channel,
      lastCursor: this.endCursor,
    });
    this.updateEndCursor(categoriesData.pageInfo.endCursor);
    return {
      products: mapCategoriesToContentfulProducts(categoriesData, channel),
      pagination: {
        ...defaultPagination,
        total: categoriesData.totalCount,
        hasNextPage: categoriesData.pageInfo.hasNextPage,
      },
    };
  };

  getCollections = async (search: string, channel: string) => {
    const collectionsData = await this.apiClient.fetchCollections({
      search,
      channel,
      lastCursor: this.endCursor,
    });
    this.updateEndCursor(collectionsData.pageInfo.endCursor);
    return {
      products: mapCollectionsToContentfulProducts(collectionsData, channel),
      pagination: {
        ...defaultPagination,
        total: collectionsData.totalCount,
        hasNextPage: collectionsData.pageInfo.hasNextPage,
      },
    };
  };

  getProducts = async (search: string, channel: string) => {
    const productsData = await this.apiClient.fetchProducts({
      search,
      channel,
      lastCursor: this.endCursor,
    });
    this.updateEndCursor(productsData.pageInfo.endCursor);
    return {
      products: mapProductsToContentfulProducts(productsData, channel),
      pagination: {
        ...defaultPagination,
        total: productsData.totalCount,
        hasNextPage: productsData.pageInfo.hasNextPage,
      },
    };
  };

  getVariants = async (search: string, channel: string) => {
    const variantsData = await this.apiClient.fetchVariants({
      search,
      channel,
      lastCursor: this.endCursor,
    });
    this.updateEndCursor(variantsData.pageInfo.endCursor);
    return {
      products: mapVariantsToContentfulProducts(variantsData, channel),
      pagination: {
        ...defaultPagination,
        total: variantsData.totalCount,
        hasNextPage: variantsData.pageInfo.hasNextPage,
      },
    };
  };

  getItems = async (search: string, channel: string, skuTypeId: string) => {
    this.resetPagination(search, channel, skuTypeId);
    switch(skuTypeId) {
      case SkuTypeIds.Category:
        return await this.getCategories(search, channel);
      case SkuTypeIds.Collection:
        return await this.getCollections(search, channel);
      case SkuTypeIds.Product:
        return await this.getProducts(search, channel);
      case SkuTypeIds.Variant:
        return await this.getVariants(search, channel);
    }
  };

  getChannels = async () => {
    const channels = await this.apiClient.fetchChannels();
    return channels;
  };

  private hasFilteringChanged = (search?: string, channel?: string, skuTypeId?: string): boolean =>
    search !== this.lastSearch ||
    channel !== this.lastChannel ||
    skuTypeId !== this.lastSkuTypeId;

  private resetPagination = (search?: string, channel?: string, skuTypeId?: string) => {
    if (!this.hasFilteringChanged(search, channel, skuTypeId)) {
      return;
    }

    this.updateSearch(search);
    this.updateChannel(channel);
    this.updateSkuTypeId(skuTypeId);
    this.updateEndCursor('');
  };

  private updateSearch = (search?: string) => {
    this.lastSearch = search;
  };

  private updateChannel = (channel?: string) => {
    this.lastChannel = channel;
  };

  private updateSkuTypeId = (skuTypeId?: string) => {
    this.lastSkuTypeId = skuTypeId;
  };

  private updateEndCursor = (endCursor: string) => {
    this.endCursor = endCursor;
  };
}

export default PaginatedFetcher;
