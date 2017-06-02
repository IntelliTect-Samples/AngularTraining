const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: { 'main-client': './ClientApp/src/main.ts' },
    output: {
        filename: '[name].js',
        publicPath: '/dist/',
        path: path.resolve(__dirname, 'wwwroot/dist')
    },
    resolve: { extensions: ['.js', '.ts'] },
    module: {
        rules: [
            { test: /\.ts$/, include: /ClientApp/, use: ['awesome-typescript-loader?silent=true', 'angular2-template-loader'] }
        ]
    },
    plugins: [
        new CopyWebpackPlugin([{
            from: './ClientApp/src/index.html',
            to: path.resolve(__dirname, 'wwwroot')
        }]),
        new webpack.DllReferencePlugin({
            context: __dirname,
            manifest: require('./wwwroot/dist/vendor-manifest.json')
        })
    ]
};