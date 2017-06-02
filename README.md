## Add Basic Angular Support

Install the following Extensions
- npm task runner
- open command line

Add package.json and add the following packages (with npm install <package> --save-dev):
- @angular/common
- @angular/compiler
- @angular/core
- @angular/platform-browser
- @angular/platform-browser-dynamic
- @types/node
- angular2-template-loader
- awesome-typescript-loader
- copy-webpack-plugin
- reflect-metadata
- rxjs
- typescript
- webpack
- zone.js

Add the following scripts to package.json
```
"webpack": "webpack",
"webpack-vendor": "webpack --config webpack.config.vendor.js",
"webpack-watch": "webpack --watch"
```

Add the following packages to csproj
- microsoft.aspnetcore.staticfiles
- modify startup.cs Configure method and add app.UseDefaultFiles() and app.UseStaticFiles()

Create hello world Angular application
- ClientApp/src/index.html - add the following lines to the body tag
```
<my-app>Loading...</my-app>
<script src="dist/vendor.js"></script>
<script src="dist/main-client.js"></script>
```
- ClientApp/src/main.ts
```
import 'reflect-metadata';
import 'zone.js';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

const modulePromise = platformBrowserDynamic().bootstrapModule(AppModule);
```
- ClientApp/src/app/app.module.ts
```
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MyAppComponent } from './_components/my-app/my-app.component';

@NgModule({
    imports: [
        BrowserModule
    ],
    bootstrap: [MyAppComponent],
    declarations: [
        MyAppComponent
    ]
})
export class AppModule { }
```
- ClientApp/src/app/_components/my-app/my-app.component.ts
```
import { Component } from '@angular/core';

@Component({
    selector: 'my-app',
    template: '<h1>Hello World from Angular</h1>'
})
export class MyAppComponent {}
```

Setup webpack.config.js and webpack.config.vendor.js
- webpack.config.vendor.js
```
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
```
- webpack.config.js
```
const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {'main-client': './ClientApp/main.ts'},
    output: {
        filename: '[name].js',
        publicPath: '/dist/',
        path: path.resolve(__dirname, 'wwwroot/dist')
    },
    resolve: { extensions: ['.js', '.ts'] },
    module: {
        rules: [
            {test: /\.ts$/, include: /ClientApp/, use: ['awesome-typescript-loader?silent=true', 'angular2-template-loader']}
        ]
    },
    plugins: [
        new CopyWebpackPlugin([{
            from: './ClientApp/index.html',
            to: path.resolve(__dirname, 'wwwroot')
        }]),
        new webpack.DllReferencePlugin({
            context: __dirname,
            manifest: require('./wwwroot/dist/vendor-manifest.json')
        })
    ]
};
```

Configure Typescript
- Add tsconfig.json (and add the following lines)
  - "moduleResolution": "node",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "skipDefaultLibCheck": true,
    "lib": [ "es6", "dom" ],
    "types": ["node"]
- Disable typescript compilation in csproj
  - &lt;TypeScriptCompileBlocked&gt;true&lt;/TypeScriptCompileBlocked&gt;