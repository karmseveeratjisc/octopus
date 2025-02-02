import * as I from 'interface';

const updateAll: I.Schema = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            id: {
                type: 'string'
            },
            publicationId: {
                type: 'string'
            },
            type: {
                type: 'string',
                enum: <I.ReferenceType[]>['DOI', 'URL', 'TEXT']
            },
            text: {
                type: 'string'
            },
            location: {
                type: 'string'
            }
        },
        required: ['type', 'text', 'id', 'publicationId'],
        additionalProperties: false
    }
};

export default updateAll;
