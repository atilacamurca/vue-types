// Karma configuration
// Generated on Wed Oct 26 2016 17:54:27 GMT+0200 (CEST)

const path = require('path');
// const resolve = require('rollup-plugin-node-resolve');
// const commonjs = require('rollup-plugin-commonjs');
// const typescript = require('rollup-plugin-typescript2');
// const replace = require('rollup-plugin-replace');
// const stub = require('rollup-plugin-stub');
// const globals = require('rollup-plugin-node-globals');
// const builtins = require('rollup-plugin-node-builtins');

const production = process.env.PRODUCTION === 'true';

//fixing mocha bug: https://github.com/karma-runner/karma-mocha/issues/203
const fixMocha = function(files) {
  files.unshift({
    pattern: path.resolve('./node_modules/core-js/client/core.js'),
    included: true,
    served: true,
    watched: false
  })
}

fixMocha.$inject = ['config.files']

const baseConfig = {
  // base path that will be used to resolve all patterns (eg. files, exclude)
  basePath: '',

  // frameworks to use
  // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
  frameworks: ['mocha', 'karma-typescript', 'inline-mocha-fix'],

  plugins: [
    'karma-*',
    {
      'framework:inline-mocha-fix': ['factory', fixMocha]
    }
  ],

  // list of files / patterns to load in the browser
  files: [
    { pattern: 'src/*.ts', included: false },
    { pattern: 'test/**/*.spec.ts' }
  ],

  // preprocess matching files before serving them to the browser
  // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
  preprocessors: {
    // add webpack as preprocessor
    'src/**/*.ts': ['karma-typescript'],
    'test/**/*.spec.ts': ['karma-typescript']
  },

  exclude: [
    'src/**/*.cjs.ts'
  ],

  // rollupPreprocessor: {
  //   plugins: [
  //     resolve({
  //       preferBuiltins: true
  //     }),
  //     commonjs(),
  //     typescript({
  //       tsconfig: path.join(__dirname, 'tsconfig.es.json'),
  //       typescript: require('typescript'),
  //       rollupCommonJSResolveHack: true,
  //       clean: true
  //     }),
  //     replace({
  //       'process.env.NODE_DEBUG': !production
  //     }),
  //     stub(),
  //     globals(),
  //     builtins()
  //   ],
  //   output: {
  //     format: 'iife',
  //     name: 'VueTypes',
  //     sourcemap: 'inline'
  //   }
  // },

  karmaTypescriptConfig: {
    compilerOptions: {
      types : [
        'mocha',
        'node'
      ]
    },
    include: [
      'test/*.spec.ts',
      'src/**/*.ts'
    ],
    coverageOptions: {
      exclude: /\.test\.ts/,
    },
    bundlerOptions: {
      transforms: [
          require('karma-typescript-es6-transform')()
      ]
    },
    tsconfig: './tsconfig.json'
  },

  // test results reporter to use
  // possible values: 'dots', 'progress'
  // available reporters: https://npmjs.org/browse/keyword/karma-reporter
  reporters: ['mocha', 'karma-typescript'],

  // web server port
  port: 9876,

  // enable / disable colors in the output (reporters and logs)
  colors: true,

  concurrency: Infinity
}

module.exports = (config) => {
  config.set(Object.assign({}, baseConfig, {

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG

    logLevel: config.LOG_INFO
  }));
};

module.exports.baseConfig = baseConfig
