export const companyDocumentsSchema = {
  title: 'Business documents',
  type: 'object',
  properties: {
    bankStatement: {
      title: 'Bank Statement',
      type: 'string',
      description: 'Not older than 6 months.',
    },
    companyStructure: {
      title: 'Company structure (directors & legal representatives)',
      type: 'string',
    },
    registrationCertificate: {
      title: 'Company Certificate of Registration',
      type: 'string',
    },
    addressProof: {
      title: 'Utility bill as proof of address of the company',
      type: 'string',
    },
  },
  required: ['bankStatement', 'companyStructure', 'registrationCertificate', 'addressProof'],
};

export const companyDocumentsUISchema = {
  'ui:options': {
    submitButtonOptions: {
      submitText: 'Submit',
    },
  },
  registrationCertificate: {
    'ui:field': 'FileInput',
  },
  addressProof: {
    'ui:field': 'FileInput',
  },
  bankStatement: {
    'ui:field': 'FileInput',
  },
  companyStructure: {
    'ui:field': 'FileInput',
  },
};
