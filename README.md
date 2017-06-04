## Add Angular CLI, Bootstrap, and FontAwesome

Add package.json and add the following packages (with npm install <package> --save-dev):
- @angular/cli
- bootstrap
- font-awesome
- jquery
- rimraf

Also add the following packages that will be needed by webpack to support html templates, css files, and font files
- css-loader
- extract-text-webpack-plugin
- file-loader
- html-loader
- to-string-loader
- url-loader

Create .angular-cli.json
```
{
  "apps": [
    {
      "root": "ClientApp/src"
    }
  ],
  defaults: {
    component: {
        spec: false
    }
  }
}
```

Modify webpack.config.vendor.js as follows
- Add the following two declarations
```
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractCSS = new ExtractTextPlugin('vendor.css');
```
- Modify vendor array
```
'bootstrap',
'bootstrap/dist/css/bootstrap.css',
'font-awesome/css/font-awesome.css',
'jquery',
```
- Add a module section below the output section
```
module: {
    rules: [
        { test: /\.css(\?|$)/, use: extractCSS.extract({ use: 'css-loader' }) },
        { test: /\.(png|woff|woff2|eot|ttf|svg)(\?|$)/, use: 'url-loader?limit=100000' }
    ]
},
```
- Add the following lines to the plugin section
```
new webpack.ProvidePlugin({ $: 'jquery', jQuery: 'jquery' }),
extractCSS,
```

Modify index.html to now take advantage of our new styling
- Add a reference to the newly created vendor.css file
```
<link href="dist/vendor.css" rel="stylesheet" />
```
- Modify the &lt;my-app&gt; directive to look like the following
```
<div class="container">
    <my-app><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>Loading...</my-app>
</div>
```
Update the package.json file and modify the webpack script to be
```
"webpack": "rimraf wwwroot/dist/main-client.* && webpack",
```