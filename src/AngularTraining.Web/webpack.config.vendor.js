const path = require('path');
const webpack = require('webpack');

module.exports = {
    stats: { modules: false },
    entry: {
        vendor: [
            '@angular/common',
            '@angular/compiler',
            '@angular/core',
            '@angular/platform-browser',
            '@angular/platform-browser-dynamic',
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
    resolve: { extensions: ['.js'] },
    plugins: [
        new webpack.DllPlugin({
            path: path.join(__dirname, 'wwwroot', 'dist', '[name]-manifest.json'),
            name: '[name]_[hash]'
        })
    ]
}