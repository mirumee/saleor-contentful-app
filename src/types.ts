export type ParsedSKU = {
  ID: string;
  Type: SkuTypeId;
  Channel: string;
};

export enum SkuTypeIds {
  Category = 'Category',
  Collection = 'Collection',
  Product = 'Product',
  Variant = 'Variant',
}

export type SkuTypeId = `${SkuTypeIds}`

export interface ClientConfig {
  apiEndpoint: string;
  apiToken: string;
}

export interface ApiResponseCommonData {
  pageInfo: PageInfo;
  totalCount: number;
}

export type PageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor: string;
};

export type Image = { url: string };

export type Channel = {
  slug: string;
  name: string;
};

export type ChannelData = {
  channels: Channel;
};

export type ProductsData = ApiResponseCommonData & {
  edges: ProductCountableEdge[];
};

export type ProductCountableEdge = {
  node: ApiProduct;
  cursor: string;
};

export type ApiProduct = {
  id: string;
  images: Image[];
  name: string;
  channel: string;
};

export type CategoriesData = ApiResponseCommonData & {
  edges: CategoryCountableEdge[];
};

export type CategoryCountableEdge = {
  node: ApiCategory;
  cursor: string;
};

export type ApiCategory = {
  id: string;
  name: string;
  backgroundImage: Image;
};

export type CollectionsData = ApiResponseCommonData & {
  edges: CollectionCountableEdge[];
};

export type CollectionCountableEdge = {
  node: ApiCollection;
  cursor: string;
};

export type ApiCollection = {
  id: string;
  name: string;
  backgroundImage: Image;
};

export type VariantsData = ApiResponseCommonData & {
  edges: VariantCountableEdge[];
};

export type VariantCountableEdge = {
  node: ApiVariant;
  cursor: string;
};

export type ApiVariant = {
  id: string;
  name: string;
  media: Image[];
};
