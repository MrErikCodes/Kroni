module.exports = function (api) {
  api.cache(true);
  const env = process.env.BABEL_ENV || process.env.NODE_ENV;
  const isProd = env === 'production' || env === 'preview';
  const plugins = [];
  if (isProd) {
    // Strip console.log/info/debug in prod + preview; keep error/warn for Sentry.
    plugins.push(['transform-remove-console', { exclude: ['error', 'warn'] }]);
  }
  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
