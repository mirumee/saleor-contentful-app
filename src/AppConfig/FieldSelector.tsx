import { Checkbox, Flex, Form, Paragraph, Radio, Subheading } from '@contentful/f36-components';
import { Multiselect } from '@contentful/f36-multiselect';
import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';
import * as React from 'react';
import { Integration } from '@contentful/ecommerce-app-base';
import { CompatibleFields, ContentType, FieldsSkuTypes, SelectedFields } from './fields';

interface Props {
  contentTypes: ContentType[];
  compatibleFields: CompatibleFields;
  selectedFields: SelectedFields;
  onSelectedFieldsChange: Function;
  fieldSkuTypes: FieldsSkuTypes;
  onFieldSkuTypesChange: (fieldSkuTypes: FieldsSkuTypes) => void;
  skuTypes?: Integration['skuTypes'];
}

interface State {
  initialSelectedFields: SelectedFields;
  changedSkuTypes: Record<string, Record<string, boolean>>;
}

const styles = {
  helpText: css({
    marginLeft: tokens.spacingL,
    marginTop: tokens.spacingS,
  }),
};

export default class FieldSelector extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      initialSelectedFields: { ...props.selectedFields },
      changedSkuTypes: {},
    };
  }

  filterSelectedFieldSkuTypes = (updated: FieldsSkuTypes) => {
    // Filter out sku type values of fields, which are no longer used and may interfere with validation
    for (const contentTypeId in updated) {
      const updatedFiltered = {} as Record<string, string[]>;
      for (const fieldId of this.props.selectedFields[contentTypeId] || []) {
        updatedFiltered[fieldId] = updated[contentTypeId][fieldId] || [];
      }
      updated[contentTypeId] = updatedFiltered;
    }
  }

  onSelectedFieldChange = (
    ctId: string,
    fieldId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updated = { ...this.props.selectedFields };

    if (e.currentTarget.checked) {
      updated[ctId] = (updated[ctId] || []).concat([fieldId]);
    } else {
      updated[ctId] = (updated[ctId] || []).filter((cur) => cur !== fieldId);
    }

    const fieldSkuTypes = this.props.fieldSkuTypes;
    this.filterSelectedFieldSkuTypes(fieldSkuTypes);
    this.props.onFieldSkuTypesChange(fieldSkuTypes);
    this.props.onSelectedFieldsChange(updated);
  };

  onFieldSkuTypesChange = (
    ctId: string,
    fieldId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const updated = { ...this.props.fieldSkuTypes };

    const isOldField = this.state.initialSelectedFields?.[ctId]?.includes(fieldId) === true;

    if (isOldField === true) {
      // They are changing the type of an existing field, warn them of
      // potential trouble
      const changedSkuTypes = { ...this.state.changedSkuTypes };

      if (changedSkuTypes[ctId] === undefined) {
        changedSkuTypes[ctId] = {};
      }

      changedSkuTypes[ctId][fieldId] = true;

      this.setState({
        changedSkuTypes,
      });
    }

    if (updated[ctId] === undefined) {
      updated[ctId] = {};
    }

    if (!Array.isArray(updated[ctId][fieldId])) {
      updated[ctId][fieldId] = [];
    }
    const { checked, value } = e.target;
    if (checked) {
      updated[ctId][fieldId].push(value);
    } else {
      updated[ctId][fieldId] = updated[ctId][fieldId].filter(selectedValue => selectedValue !== value);
    }

    this.filterSelectedFieldSkuTypes(updated);
    this.props.onFieldSkuTypesChange(updated);
  };

  render() {
    const {
      compatibleFields,
      contentTypes,
      selectedFields,
      fieldSkuTypes,
      skuTypes = [],
    } = this.props;
    const { changedSkuTypes } = this.state;

    return (
      <>
        {contentTypes.map((ct) => (
          <div key={ct.sys.id} className={css({ marginTop: tokens.spacingL })}>
            <Subheading>{ct.name}</Subheading>
            <Form>
              {compatibleFields[ct.sys.id].map((field) => (
                <Flex marginTop="spacingM" flexDirection="column" gap="spacingXs" key={field.id}>
                  <Checkbox
                    id={`field-box-${ct.sys.id}-${field.id}`}
                    helpText={`${
                      field.type === 'Symbol' ? 'Short text' : 'Short text, list'
                    } · Field ID: ${field.id}`}
                    isChecked={(selectedFields[ct.sys.id] || []).includes(field.id)}
                    onChange={this.onSelectedFieldChange.bind(this, ct.sys.id, field.id)}
                  >
                    {field.name}
                  </Checkbox>
                  {skuTypes.length > 0 && (selectedFields[ct.sys.id] || []).includes(field.id) ? (
                    <>
                      <Flex gap="spacingL">
                      <Multiselect
                        currentSelection={fieldSkuTypes[ct.sys.id]?.[field.id]}
                        popoverProps={{ isFullWidth: true }}
                      >
                        {skuTypes.map((skuType) => {
                          return (
                            <Multiselect.Option
                              key={`skuType-${ct.sys.id}-${field.id}-${skuType.id}`}
                              itemId={`skuType-${ct.sys.id}-${field.id}-${skuType.id}`}
                              value={skuType.id}
                              label={skuType.name}
                              onSelectItem={this.onFieldSkuTypesChange.bind(this, ct.sys.id, field.id)}
                              isChecked={(fieldSkuTypes[ct.sys.id]?.[field.id] || []).includes(skuType.id)}
                            />
                          );
                        })}
                      </Multiselect>
                      </Flex>
                      {changedSkuTypes?.[ct.sys.id]?.[field.id] === true ? (
                        <Paragraph className={styles.helpText}>
                          Note: Changing SKU type can cause problems with existing entries relying
                          on the old SKU type.
                        </Paragraph>
                      ) : null}
                    </>
                  ) : null}
                </Flex>
              ))}
            </Form>
          </div>
        ))}
      </>
    );
  }
}
