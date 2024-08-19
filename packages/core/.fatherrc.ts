export default {
    esm: {
      input: 'src',
      platform: 'browser',
      transformer: 'babel',
    },
    cjs: {
      input: 'src',
      platform: 'node',
      transformer: 'esbuild',
    },
  };