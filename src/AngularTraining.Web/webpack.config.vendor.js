const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractCSS = new ExtractTextPlugin('vendor.css');

module.exports = {
    stats: { modules: false },
    entry: {
        vendor: [
            '@angular/common',
            '@angular/compiler',
            '@angular/core',
            '@angular/forms',
            '@angular/platform-browser',
            '@angular/platform-browser-dynamic',
            'bootstrap',
            'bootstrap/dist/css/bootstrap.css',
            'font-awesome/css/font-awesome.css',
            'jquery',
            'reflect-metadata',
            'rxjs',
            'zone.js'
        ]
    },
    output: {
        publicPath: '/dist/',
        filename: '[name].js',
        library: '[name]_[hash]',
        path: path.join(__dirname, 'wwwroot', 'dist')
    },
    module: {
        rules: [
            { test: /\.css(\?|$)/, use: extractCSS.extract({ use: 'css-loader' }) },
            { test: /\.(png|woff|woff2|eot|ttf|svg)(\?|$)/, use: 'url-loader?limit=100000' }
        ]
    },
    resolve: { extensions: ['.js'] },
    plugins: [
        new webpack.ProvidePlugin({ $: 'jquery', jQuery: 'jquery' }),
        extractCSS,
        new webpack.DllPlugin({
            path: path.join(__dirname, 'wwwroot', 'dist', '[name]-manifest.json'),
            name: '[name]_[hash]'
        })
    ]
}