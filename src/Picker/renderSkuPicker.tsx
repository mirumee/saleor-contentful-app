import React from 'react';
import { DialogExtensionSDK } from '@contentful/app-sdk';
import { render } from 'react-dom';
import { SkuPicker } from './SkuPicker';
import { MakeSaveBtnTextFn, ProductPreviewsFn, ProductsFn } from '@contentful/ecommerce-app-base';

interface Props {
  sdk: DialogExtensionSDK;
  fetchProductPreviews: Function;
  fetchProducts: Function;
  fetchChannels: Function;
  searchDelay?: number;
  fieldSkuTypeIds?: string[];
  makeSaveBtnText?: MakeSaveBtnTextFn;
}

export function renderSkuPicker(
  elementId: string,
  {
    sdk,
    fetchChannels,
    fetchProductPreviews,
    fetchProducts,
    searchDelay,
    fieldSkuTypeIds,
    makeSaveBtnText,
  }: Props
): void {
  const root = document.getElementById(elementId);

  render(
    <SkuPicker
      sdk={sdk}
      fetchProductPreviews={fetchProductPreviews}
      fetchProducts={fetchProducts}
      fetchChannels={fetchChannels}
      searchDelay={searchDelay}
      fieldSkuTypeIds={fieldSkuTypeIds}
      // @ts-expect-error Incompatible types
      makeSaveBtnText={makeSaveBtnText}
    />,
    root
  );
}
