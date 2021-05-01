const parse = require('url-parse')
const {override, fixBabelImports, addLessLoader} = require('customize-cra')

const cspHtmlWebpackPlugin = require("csp-html-webpack-plugin");

const cspConfigPolicy = {
    'default-src': "'none'",
    'base-uri': "'self'",
    'child-src': ["'self'", "https://*.paypal.com", "https://*.google.com", "https://*.braintreegateway.com/", "https://*.braintreegateway.com/", "https://*.paypalobjects.com","https://*.hotjar.com", "https://*.freshchat.com"],
    //DON'T ADD "unsafe-inline"
    'script-src': ["'self'", "https://*.google.com","http://*.hotjar.com","https://*.hotjar.com","http://*.hotjar.io","https://*.hotjar.io","'unsafe-eval'","'unsafe-inline'"],
    'script-src-elem': ["'self'", "https://*.paypal.com", "https://*.google.com", "https://cdn.tiny.cloud", "https://www.gstatic.com/",  "https://*.braintreegateway.com/", "https://*.paypalobjects.com","https://*.hotjar.com","http://*.hotjar.com","'unsafe-eval'","'unsafe-inline'", "https://*.freshchat.com"],
    'style-src': ["'self'", "'unsafe-inline'", "https://cdn.shopify.com", "https://cdn.tiny.cloud","https://*.hotjar.com", "https://*.freshchat.com"],
    'img-src ': ["'self'", "blob:", "data:", "https://*.googleapis.com", "https://*.googleusercontent.com", "https://cdn.shopify.com", "https://sp.tinymce.com", "https://*.paypal.com","https://*.hotjar.com","https://assets.printholo.com"],
    'font-src': ["'self'", "https://cdn.shopify.com","https://*.hotjar.com", "https://fulfillmenthub.storage.googleapis.com"],
    'manifest-src': "'self'",
    'object-src': "'none'",
    'connect-src': ["'self'", parse(process.env.REACT_APP_BACKEND_URL).origin || "", parse(process.env.REACT_APP_MOCKUP_SEVICE_URL).origin || "", "https://*.paypal.com","https://*.hotjar.com","wss://*.hotjar.com","https://vc.hotjar.io:*","http://*.hotjar.com:*","http://*.hotjar.io","https://*.hotjar.io"],
};

function addCspHtmlWebpackPlugin(config) {
    // if(process.env.NODE_ENV === 'production') {
        config.plugins.push(new cspHtmlWebpackPlugin(cspConfigPolicy, {
            hashEnabled: {
                'script-src': false,
                'style-src': false
            },
            nonceEnabled: {
                'script-src': false,
                'style-src': false
            },
        }));
    // }

    return config;
}

module.exports = override(
    addCspHtmlWebpackPlugin,
    fixBabelImports('import', {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true,
    }),
    addLessLoader({
        javascriptEnabled: true
    })
)
module.exports = function override(webpackConfig) {
  webpackConfig.module.rules.push({
    test: /\.mjs$/,
    include: /node_modules/,
    type: "javascript/auto"
  });

  return webpackConfig;
}