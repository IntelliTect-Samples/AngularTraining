## Use Angular CLI to scaffold out major project elements

First, we need to delete the my-app component since that was just a place holder

Next create the root TimeTrackerApp component
```
ng g component _components/TimeTrackerApp
```

Update index.html to use time-tracker-app instead of main-app and also update the app.module and remove references to MainApp

Update webpack.config.js to recognize new formats introduced (html and css files instead of just inline templates)
- add the following rules for html and css
```
{ test: /\.html$/, include: /ClientApp/, use: ['html-loader?minimize=false'] },
{ test: /\.css$/, use: ['to-string-loader', 'css-loader'] }
```
- also since we will be doing more and more dev now, enable map files. Add the following to the end of the plugins array
```
.concat([
    new webpack.SourceMapDevToolPlugin({
        filename: '[file].map',
        moduleFilenameTemplate: path.relative('./wwwroot/dist', '[resourcePath]')
    })
])
```

This application is going to consist of the following modules
- admin
- login
- nav-bar
- time-entry

Create each module using the following command
```
ng g module <ModuleName>
```

For each newly created module directory, create an _components directory

Create a NavBar component under the NavBar module using the following command
```
ng g component nav-bar/_components/NavBar
```

Create NewTimeEntry, TimeEntry, and TimeEntryList components under the TimeEntry module
Modify time-entry.component.html to have a line for new-time-entry and time-entry-list
```
<new-time-entry></new-time-entry>
<time-entry-list></time-entry-list>
```

Build out basic application structure without routing
Inside of time-entry-app.component.html file add:
```
<nav-bar></nav-bar>
<div class='container'>
    <time-entry></time-entry>
</div>
```

Add the NavBarModule and TimeEntryModule to the main app.module

Create index.ts files (barrels) for NavBar and TimeEntry modules

Need to export NavBarComponent from NavBarModule and TimeEntryComponent from TimeEntryModule