export const definition = {
  definitionType: 'statechart-json',
  definition: {
    id: 'dynamic_collection_flow',
    predictableActionArguments: true,
    initial: 'personal_details',
    context: {},
    states: {
      personal_details: {
        on: {
          NEXT: 'company_information',
        },
      },
      company_information: {
        on: {
          NEXT: 'business_address_information',
          PREVIOUS: 'personal_details',
        },
      },
      business_address_information: {
        on: {
          NEXT: 'company_ownership',
          PREVIOUS: 'company_information',
        },
      },
      company_ownership: {
        on: {
          NEXT: 'company_documents',
          PREVIOUS: 'business_address_information',
        },
      },
      company_documents: {
        on: {
          NEXT: 'finish',
          PREVIOUS: 'company_ownership',
        },
      },
      finish: { type: 'final' },
    },
  },
  extensions: {
    apiPlugins: [
      {
        name: 'update_end_user',
        pluginKind: 'api',
        url: `{collectionFlow.config.apiUrl}/api/v1/collection-flow/end-user}`,
        method: 'POST',
        headers: { Authorization: 'Bearer {query.token}' },
        stateNames: [],
        request: {
          transform: [
            {
              transformer: 'jmespath',
              mapping: `{
              firstName: entity.data.additionalInfo.mainRepresentative.firstName,
              lastName: entity.data.additionalInfo.mainRepresentative.lastName,
              additionalInfo: {title: entity.data.additionalInfo.mainRepresentative.additionalInfo.jobTitle},
              phone: entity.data.additionalInfo.mainRepresentative.phone,
              dateOfBirth: entity.data.additionalInfo.mainRepresentative.dateOfBirth
              }`,
            },
          ],
        },
      },
      {
        name: 'sync_workflow_runtime',
        pluginKind: 'api',
        url: `{collectionFlow.config.apiUrl}/api/v1/collection-flow/sync}`,
        method: 'PUT',
        stateNames: [
          'personal_details',
          'company_information',
          'business_address_information',
          'company_ownership',
          'company_documents',
        ],
        headers: { Authorization: 'Bearer {query.token}' },
        request: {
          transform: [
            {
              transformer: 'jmespath',
              mapping: `{
              data: {
                context: @,
                endUser: entity.data.additionalInfo.mainRepresentative,
                business: entity.data,
                ballerineEntityId: entity.ballerineEntityId
                }
              }`,
            },
          ],
        },
      },
      {
        name: 'finish_workflow',
        pluginKind: 'api',
        url: `{collectionFlow.config.apiUrl}/api/v1/collection-flow}`,
        method: 'PUT',
        stateNames: ['finish'],
        headers: { Authorization: 'Bearer {query.token}' },
        request: {
          transform: [
            {
              transformer: 'jmespath',
              mapping: `{
              data: {
                context: @,
                endUser: entity.data.additionalInfo.mainRepresentative,
                business: entity.data,
                ballerineEntityId: entity.ballerineEntityId
                }
              }`,
            },
          ],
        },
      },
      {
        name: 'send_collection_flow_finished',
        pluginKind: 'api',
        url: `{collectionFlow.config.apiUrl}/api/v1/collection-flow/send-event`,
        method: 'POST',
        stateNames: ['finish'],
        headers: { Authorization: 'Bearer {query.token}' },
        request: {
          transform: [
            {
              transformer: 'jmespath',
              mapping: `{eventName: 'COLLECTION_FLOW_FINISHED'}`,
            },
          ],
        },
      },
    ],
  },
};
