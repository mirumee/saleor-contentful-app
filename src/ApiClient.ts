import { print } from 'graphql/language/printer';
import { DocumentNode } from 'graphql';
import { fetchProductsQuery, fetchChannelsQuery, fetchCategoriesQuery, fetchCollectionsQuery, fetchVariantsQuery } from './queries';
import { ClientConfig, ChannelData, ProductsData, CategoriesData, CollectionsData, VariantsData } from './types';

type FetchItemsParams = {
  ids?: string[];
  lastCursor?: string;
  search?: string;
  channel: string;
};

class ApiClient {
  private apiEndpoint: string;
  private apiToken: string;

  constructor({ apiEndpoint, apiToken }: ClientConfig) {
    this.apiEndpoint = apiEndpoint;
    this.apiToken = apiToken;
  }

  fetchCategories = async ({ ids, channel, search, lastCursor }: FetchItemsParams): Promise<CategoriesData> => {
    const res = await this.fetch(fetchCategoriesQuery(ids, channel, search, lastCursor));

    const {
      data: { categories }
    } = await res.json();

    return categories;
  };

  fetchCollections = async ({ ids, channel, search, lastCursor }: FetchItemsParams): Promise<CollectionsData> => {
    const res = await this.fetch(fetchCollectionsQuery(ids, channel, search, lastCursor));

    const {
      data: { collections }
    } = await res.json();

    return collections;
  };

  fetchProducts = async ({ ids, channel, search, lastCursor }: FetchItemsParams): Promise<ProductsData> => {
    const res = await this.fetch(fetchProductsQuery(ids, channel, search, lastCursor));

    const {
      data: { products }
    } = await res.json();

    return products;
  };
  
  fetchVariants = async ({ ids, channel, search, lastCursor }: FetchItemsParams): Promise<VariantsData> => {
    const res = await this.fetch(fetchVariantsQuery(ids, channel, search, lastCursor));

    const {
      data: { productVariants }
    } = await res.json();

    return productVariants;
  };

  fetchChannels = async (): Promise<ChannelData> => {
    const res = await this.fetch(fetchChannelsQuery());

    const {
      data: { channels }
    } = await res.json();

    return channels;
  };

  private fetch = (query: DocumentNode) =>
    window.fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Authorization-Bearer': this.apiToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: print(query) })
    });
}

export default ApiClient;
