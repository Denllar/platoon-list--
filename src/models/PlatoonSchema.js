import Store from 'electron-store';

export const createPlatoonStore = () => {
  return new Store({
    name: 'platoons',
    schema: {
      platoons: {
        type: 'array',
        default: [],
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            number: { type: 'string' },
            type: { type: 'string' },
          }
        }
      }
    }
  });
};

export const store = createPlatoonStore();