export const shareholdersSchema = {
  title: 'Company Ownership',
  type: 'object',
  properties: {
    check: {
      type: 'boolean',
      description: 'I own 25% or more of the company',
      default: false,
    },
    shareholders: {
      title: '',
      description:
        'Add all natural persons that own or control, directly or Indirectly more than 25% of the Company.',
      type: 'array',
      items: {
        title: 'Shareholder',
        type: 'object',
        properties: {
          name: {
            type: 'object',
            title: '',
            properties: {
              firstName: {
                title: 'Name',
                type: 'string',
                minLength: 1,
              },
              lastName: {
                title: '',
                type: 'string',
                minLength: 1,
              },
            },
            required: ['firstName', 'lastName'],
          },
          title: {
            type: 'string',
            title: 'CEO / Manager / Partner',
          },
          birthDate: {
            type: 'string',
            title: 'Date of Birth',
            minLength: 1,
          },
          email: {
            type: 'string',
            title: 'Email',
            format: 'email',
            minLength: 1,
          },
        },
        required: ['name', 'email', 'birthDate'],
      },
    },
  },
};

export const shareholdersUISchema = {
  'ui:order': ['check', 'shareholders', 'birthDate', 'email'],
  'ui:options': {
    submitButtonOptions: {
      submitText: 'Continue',
    },
  },
  shareholders: {
    addText: 'Add Shareholder',
    deleteButtonClassname: 'leading-9',
    items: {
      titleClassName: 'text-sm',
      'ui:order': ['name', 'title'],
      name: {
        firstName: {
          'ui:placeholder': 'First name',
        },
        lastName: {
          'ui:label': false,
          'ui:placeholder': 'Last name',
        },
      },
      title: {
        'ui:placeholder': 'CEO / Manager / Partner',
      },
      birthDate: {
        'ui:field': 'DateInput',
        'ui:label': true,
      },
      email: {
        'ui:placeholder': 'john@example.com',
      },
    },
  },
};
