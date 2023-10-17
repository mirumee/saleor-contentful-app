import gql from 'graphql-tag';
import { ITEMS_OFFSET } from './constants';
import { getFormattedIds } from './utils';

export const fetchProductsQuery = (ids?: string[], channel?: string, search: string = '', lastCursor: string = '') => gql`
  {
    products(
      first: ${ITEMS_OFFSET},
      after: "${lastCursor}",
      channel: "${channel}",
      filter: {
        search: "${search}",
        ids: ${getFormattedIds(ids)},
        ${channel && "isPublished: true"}
      },
    ) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        node {
          id
          name
          images {
            url
          }
        }
      }
    }
  }
`;

export const fetchVariantsQuery = (ids?: string[], channel?: string, search: string = '', lastCursor: string = '') => gql`
  {
    productVariants(
      first: ${ITEMS_OFFSET},
      after: "${lastCursor}",
      channel: "${channel}",
      ids: ${getFormattedIds(ids)},
      filter: { search: "${search}" },
    ) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        node {
          id
          sku
          name
          media {
            url
          }
        }
      }
    }
  }
`;

export const fetchCategoriesQuery = (ids?: string[], channel?: string, search: string = '', lastCursor: string = '') => gql`
  {
    categories(
      first: ${ITEMS_OFFSET},
      after: "${lastCursor}",
      filter: {
        search: "${search}",
        ids: ${getFormattedIds(ids)},
      },
    ) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        node {
          id
          name
          backgroundImage {
            url
          }
        }
      }
    }
  }
`;

export const fetchCollectionsQuery = (ids?: string[], channel?: string, search: string = '', lastCursor: string = '') => gql`
  {
    collections(
      first: ${ITEMS_OFFSET},
      after: "${lastCursor}",
      channel: "${channel}",
      filter: {
        search: "${search}",
        ids: ${getFormattedIds(ids)},
        ${channel && "published: PUBLISHED"}
      },
    ) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        node {
          id
          name
          backgroundImage {
            url
          }
        }
      }
    }
  }
`;

export const fetchChannelsQuery = () => gql`
  {
    channels {
      slug
      name
    }
  }
`;
