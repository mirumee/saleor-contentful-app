import {
    AppExtensionSDK,
    DialogExtensionSDK,
    FieldExtensionSDK,
    init,
    locations,
  } from '@contentful/app-sdk';
  import { GlobalStyles } from '@contentful/f36-components';
  import * as React from 'react';
  import { render } from 'react-dom';
  import AppConfig from './AppConfig/AppConfig';
  import { Integration, setup } from '@contentful/ecommerce-app-base';
  
  export function customSetup(integration: Integration) {
    init((sdk) => {
      const root = document.getElementById('root');
      if (sdk.location.is(locations.LOCATION_APP_CONFIG)) {
        render(
          <>
            <GlobalStyles />
            <AppConfig
              name={integration.name}
              sdk={sdk as AppExtensionSDK}
              parameterDefinitions={integration.parameterDefinitions}
              validateParameters={integration.validateParameters}
              logo={integration.logo}
              color={integration.color}
              description={integration.description}
              skuTypes={integration.skuTypes}
            />
          </>,
          root
        );
      } else {
        return setup(integration);
      }
    });
  }
