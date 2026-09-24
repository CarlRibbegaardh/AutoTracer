module.exports = {
  presets: [
    ['@babel/preset-typescript', {
      isTSX: true,
      allExtensions: true
    }],
    ['@babel/preset-react', {
      runtime: 'automatic'
    }]
  ],
  plugins: [
    [
      'module:@autotracer/plugin-babel-react18',
      {
        mode: 'opt-out',
        include: ['src/**/*.tsx', 'src/**/*.ts'],
        exclude: ['**/*.test.*', '**/*.spec.*'],
        labelHooks: ['useState', 'useReducer'],
        labelHooksPattern: '^use[A-Z].*',
        importSource: '@autotracer/react18'
      }
    ]
  ]
};
