import React, { Component } from 'react';
import get from 'lodash/get';
import clamp from 'lodash/clamp';
import debounce from 'lodash/debounce';
import { DialogExtensionSDK } from '@contentful/app-sdk';
import { ProductList } from './ProductList';
import { Paginator } from './Paginator';
import {
  // MakeSaveBtnTextFn,
  Pagination,
  Product,
} from '@contentful/ecommerce-app-base';
import { ProductSelectionList } from './ProductSelectionList';
import { styles } from './styles';

import { Button, Icon, TextInput } from '@contentful/f36-components';

import { SearchIcon } from '@contentful/f36-icons';
import { Select } from '@contentful/f36-components';

import { Channel, SkuTypeIds } from '../types';
import { skuTypes } from '../constants';

export declare type MakeSaveBtnTextFn = (selectedSKUs: string[], skuType?: string[]) => string;

export interface Props {
  sdk: DialogExtensionSDK;
  fetchChannels: Function;
  fetchProductPreviews: Function;
  fetchProducts: Function;
  searchDelay?: number;
  fieldSkuTypeIds?: string[];
  makeSaveBtnText?: MakeSaveBtnTextFn;
}

interface State {
  channels: Channel[],
  activePage: number;
  search: string;
  pagination: Pagination;
  products: Product[];
  selectedProducts: Product[];
  selectedSKUs: string[];
  selectedChannel: string,
  selectedSkuTypeId: string;
}

const DEFAULT_SEARCH_DELAY = 250;

function defaultGetSaveBtnText(selectedSKUs: string[]): string {
  switch (selectedSKUs.length) {
    case 0:
      return 'Save products';
    case 1:
      return 'Save 1 product';
    default:
      return `Save ${selectedSKUs.length} products`;
  }
}

export const mapSort = (array: any[], order: any[], key: string) => {
  const sorted = array.slice().sort((a, b) => {
    const A = a[key];
    const B = b[key];
    return order.indexOf(A) > order.indexOf(B) ? 1 : -1;
  });
  return sorted;
};

export class SkuPicker extends Component<Props, State> {
  state: State = {
    activePage: 1,
    search: '',
    pagination: {
      count: 0,
      limit: 0,
      offset: 0,
      total: 0,
    },
    channels: [],
    selectedChannel: '',
    products: [],
    selectedProducts: [],
    selectedSKUs: get(this.props, ['sdk', 'parameters', 'invocation', 'fieldValue'], []),
    selectedSkuTypeId: '',
  };

  getInitialSkuTypeId = (props: Props) =>
    skuTypes.find(skuType => props.fieldSkuTypeIds?.includes(skuType.id))?.id

  setSearchCallback: () => void;

  constructor(props: Props) {
    super(props);
    this.setSearchCallback = debounce(() => {
      this.setActivePage(1);
    }, this.props.searchDelay || DEFAULT_SEARCH_DELAY);
    this.state.selectedSkuTypeId = this.getInitialSkuTypeId(props)!;
  }

  async componentDidMount() {
    await this.setChannels();
    this.updateProducts();
    this.updateSelectedProducts();
  }

  setChannels = async () => {
    const { enableChannelFilter } = this.props.sdk.parameters.invocation as Record<string, any>;
    if (enableChannelFilter === 'true') {
      const channels = await this.props.fetchChannels();
      this.setState({ channels, selectedChannel: channels[0].slug });
    }
  }

  setChannel = (event: any) => this.setState({ selectedChannel: event.target.value }, this.updateProducts);

  setSkuTypeId = (event: any) => this.setState({ selectedSkuTypeId: event.target.value }, this.updateProducts);

  setSearch = (search: string) => {
    this.setState({ search }, this.setSearchCallback);
  };

  updateProducts = async () => {
    try {
      const {
        activePage,
        pagination: { limit },
        search,
        selectedChannel,
        selectedSkuTypeId,
      } = this.state;
      const offset = (activePage - 1) * limit;
      const fetched = await this.props.fetchProducts(search, selectedChannel, selectedSkuTypeId);
      // If the request has been cancelled because a new one has been launched
      // then fetchProducts will return null
      if (fetched && fetched.pagination && fetched.products) {
        this.setState({ pagination: fetched.pagination, products: fetched.products });
      }
    } catch (error) {
      console.log(error);
      this.props.sdk.notifier.error('There was an error fetching the product list.');
    }
  };

  updateSelectedProducts = async () => {
    try {
      const { selectedSKUs } = this.state;
      const { fetchProductPreviews } = this.props;
      const selectedProductsUnsorted = await fetchProductPreviews(selectedSKUs);
      const selectedProducts = mapSort(selectedProductsUnsorted, selectedSKUs, 'sku');
      const validations = get(this.props.sdk.parameters.invocation, 'fieldValidations') as any;
      const sizeValidation = validations && validations.find((validation: any) => validation.size !== undefined);
      const minSize = sizeValidation?.size?.min;
      const maxSize = sizeValidation?.size?.max;
      if (selectedProducts.length !== 0 && validations && (selectedProducts.length < minSize || selectedProducts.length > maxSize)) {
        this.props.sdk.notifier.error(`Please provide between ${minSize} and ${maxSize} items`);
      } else {
        this.setState({ selectedProducts });
      }
    } catch (error) {
      console.log(error);
      this.props.sdk.notifier.error(
        'There was an error fetching the data for the selected products.'
      );
    }
  };

  loadMoreProducts = async () => {
    const { search, selectedChannel, selectedSkuTypeId } = this.state;
    const { pagination, products } = await this.props.fetchProducts(search, selectedChannel, selectedSkuTypeId);
    this.setState((oldState) => ({ pagination, products: [...oldState.products, ...products] }));
  };

  setActivePage = (activePage: number) => {
    const { pagination } = this.state;
    const pageCount = Math.ceil(pagination.total / pagination.limit);
    this.setState({ activePage: clamp(activePage, 1, pageCount) }, () => {
      this.updateProducts();
    });
  };

  selectProduct = (sku: string) => {
    const { fieldType } = this.props.sdk.parameters.invocation as Record<string, any>;
    const onlyOneProductCanBeSelected = fieldType === 'Symbol';

    if (this.state.selectedSKUs.includes(sku)) {
      this.setState(
        ({ selectedSKUs }) => ({
          selectedSKUs: selectedSKUs.filter((productSku) => productSku !== sku),
        }),
        () => this.updateSelectedProducts()
      );
    } else {
      this.setState(
        ({ selectedSKUs }) => ({
          selectedSKUs: onlyOneProductCanBeSelected ? [sku] : [...selectedSKUs, sku],
        }),
        () => this.updateSelectedProducts()
      );
    }
  };

  render() {
    const { search, pagination, products, selectedProducts, selectedSKUs } = this.state;
    const { makeSaveBtnText = defaultGetSaveBtnText, fieldSkuTypeIds } = this.props;
    const { enableChannelFilter } = this.props.sdk.parameters.invocation as Record<string, any>;
    const infiniteScrollingPaginationMode = 'hasNextPage' in pagination;
    const pageCount = Math.ceil(pagination.total / pagination.limit);
    const validations = get(this.props.sdk.parameters.invocation, 'fieldValidations') as any;
    const sizeValidation = validations && validations.find((validation: any) => validation.size !== undefined);
    const minSize = sizeValidation?.size?.min;
    const maxSize = sizeValidation?.size?.max;
    
    return (
      <>
        <header className={styles.header}>
          <div className={styles.leftsideControls}>
            <TextInput
              placeholder="Search..."
              type="search"
              name="sku-search"
              id="sku-search"
              testId="sku-search"
              value={search}
              onChange={(event) => this.setSearch((event.target as HTMLInputElement).value)}
            />
            <SearchIcon variant="muted" />
            {!!pagination.total && (
              <span className={styles.total}>
                Total results: {pagination.total.toLocaleString()}
              </span>
            )}
          </div>
          {enableChannelFilter === 'true' && (
            <div className={styles.selector}>
              <Select
                id="channels"
                name="channels"
                value={this.state.selectedChannel}
                onChange={this.setChannel}
              >
                {this.state.channels.map((channel) => (
                  <Select.Option value={channel.slug}>{channel.name}</Select.Option>
                ))}
              </Select>
            </div>
          )}
          <div className={styles.selector}>
            <Select
              id="sku-types"
              name="sku-types"
              value={this.state.selectedSkuTypeId}
              onChange={this.setSkuTypeId}
            >
              {skuTypes.filter(skuType => fieldSkuTypeIds?.includes(skuType.id)).map((skuType) => (
                <Select.Option value={skuType.id}>{skuType.name}</Select.Option>
              ))}
            </Select>
          </div>
          <div className={styles.rightsideControls}>
            <ProductSelectionList products={selectedProducts} selectProduct={this.selectProduct} />
            <Button
              className={styles.saveBtn}
              variant="primary"
              onClick={() => this.props.sdk.close(selectedSKUs)}
              isDisabled={selectedSKUs.length === 0 || selectedSKUs.length < minSize || selectedSKUs.length > maxSize}
            >
              {makeSaveBtnText(selectedSKUs, fieldSkuTypeIds)}
            </Button>
          </div>
        </header>
        <section className={styles.body}>
          <ProductList
            products={products}
            selectProduct={this.selectProduct}
            selectedSKUs={selectedSKUs}
          />
          {!infiniteScrollingPaginationMode && products.length > 0 && (
            <Paginator
              activePage={this.state.activePage}
              className={styles.paginator}
              pageCount={pageCount}
              setActivePage={this.setActivePage}
            />
          )}
          {infiniteScrollingPaginationMode && pagination.hasNextPage && (
            <Button
              className={styles.loadMoreButton}
              variant="transparent"
              testId="infinite-scrolling-pagination"
              onClick={this.loadMoreProducts}
              isFullWidth
            >
              Load more
            </Button>
          )}
        </section>
      </>
    );
  }
}
