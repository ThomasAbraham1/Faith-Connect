// plopfile.cjs
/** @param {import('plop').NodePlopAPI} plop */
module.exports = function (plop) {
  plop.setHelper('pascalCase', (text) =>
    text.replace(/(^|\s)\w/g, (l) => l.toUpperCase()).replace(/\s+/g, '')
  );

  plop.setGenerator('module', {
    description: 'Create dashboard module (Page + index.tsx)',
    prompts: [
      {
        type: 'input',
        name: 'moduleName',
        message: 'Module name (e.g. payment, invoices):',
        validate: (v) => (/^[a-zA-Z]+$/.test(v) ? true : 'Letters only'),
      },
      {
        type: 'input',
        name: 'routeLabel',
        message: 'Sidebar label (default: PascalCase):',
        default: ({ moduleName }) => plop.getHelper('pascalCase')(moduleName),
      },
      {
        type: 'input',
        name: 'routePath',
        message: 'Route path (e.g. /dashboard/payment):',
        default: ({ moduleName }) =>
          `/dashboard/${moduleName.replace(/([A-Z])/g, '-$1').toLowerCase()}`,
      },
    ],

    actions: (data) => {
      const { moduleName, routeLabel, routePath } = data;
      const lower = moduleName.toLowerCase();
      const pascal = plop.getHelper('pascalCase')(moduleName);

      return [
        // 1. Page component
        {
          type: 'add',
          path: `src/app/${lower}/${pascal}Page.tsx`,
          templateFile: 'plop-templates/Page.tsx.hbs',
          data: { pascal },
        },

        // 2. index.tsx – exports Pascal component
        {
          type: 'add',
          path: `src/app/${lower}/index.tsx`,
          templateFile: 'plop-templates/index.tsx.hbs',
          data: { pascal },
        },
      ];
    },
  });
};