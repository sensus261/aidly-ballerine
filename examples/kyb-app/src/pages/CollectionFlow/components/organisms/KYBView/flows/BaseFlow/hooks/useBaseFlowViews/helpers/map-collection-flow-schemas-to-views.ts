import { View } from '@app/common/providers/ViewStateProvider';
import { CollectionFlowSchema } from '@app/domains/collection-flow';
import { viewsMap } from '@app/pages/CollectionFlow/components/organisms/KYBView/flows/BaseFlow/hooks/useBaseFlowViews/views';
import { BaseFlowViewMetadata } from '@app/pages/CollectionFlow/components/organisms/KYBView/flows/BaseFlow/types';

export const mapCollectionFlowSchemasToViews = (
  schemas: CollectionFlowSchema[],
): View<BaseFlowViewMetadata>[] => {
  return schemas.map(schema => {
    const view = viewsMap[schema.key];

    if (!view) {
      throw new Error(`View with key: ${schema.key} not exists.`);
    }

    return {
      ...view,
      viewMetadata: {
        uiSchema: schema.uiSchema || {},
        formSchema: schema.formSchema,
      },
    };
  });
};
