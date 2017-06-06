## Build out application navigation
Add bootstrap styling for navigation to nav-bar.component.html
```
<nav class="navbar navbar-inverse navbar-fixed-top">
    <div class="container">
        <div class="navbar-header">
            <a class="navbar-brand">Time Tracker</a>
            <button class="navbar-toggle" type="button" data-toggle="collapse" data-target="#navbar">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
        </div>
        <div class="navbar-collapse collapse" id="navbar">
            <ul class="nav navbar-nav">
                <li>
                    <a href='#'>Time Entry</a>
                </li>
                <li>
                    <a href='#'>Admin</a>
                </li>
            </ul>
            <ul class="nav navbar-nav navbar-right">
                <li>
                    <a>FirstName LastName / Login</a>
                </li>
            </ul>
        </div>
    </div>
</nav>
```
Modify index.html and add a style tag to put a margin-top of 60px since the navigation is using fixed-top
```
<style>
   body { margin-top: 60px; }
</style>
```
### Routing
Create a _routes folder in the main app directory

Add a routes.ts file to that directory (here is where we will define our routes for the overall app)
```
import { Routes } from '@angular/router';
import { TimeEntryComponent } from "../time-entry";

export const appRoutes: Routes = [
    { path: 'timeEntry', component: TimeEntryComponent },
    { path: 'admin', loadChildren: '../admin/admin.module#AdminModule' },
    { path: '', redirectTo: '/timeEntry', pathMatch: 'full' }
]
```
Notice that @angular/router is reference and that hasn't been added yet, so need to add that via npm and added to the webpack.config.vendor.js file
- In this instance, this is used purely to get intellisense for route definitions, but since we will need it later in this lesson, we may as well just add it now.
Since we are directly referencing TimeEntryComponent, we need to add it to the time-entry barrel
```
export * from './_components/time-entry/time-entry.component';
```
Add the routing definitions to the app.module (this goes in the imports array, but is defined as RouterModule.forRoot(&lt;routeDefintion&gt;)
```
RouterModule.forRoot(appRoutes)
```
Routing relies on knowing what the base href is for the website, so need to add that tag into the head of the index.html file

Running the application now will make it look like it is working, but if the developer tools get opened, there will be an error in the console saying it "Cannot find primary outlet to load TimeEntryComponent"
- Replace &lt;time-entry&gt; in time-entry-app.component.html with &lt;router-outlet&gt;
     - this gets the app working to the point where we were before, but would be nice to have navigation light up with active link
     - also, try pressing the refresh button right now on the browser, things should end up breaking
Update the startup.cs file so that we can route correctly. What's happening is aspnet core is only serving up files from the root directory, but now we are trying to hit /timeEntry
```
app.Use(async (context, next) =>
{
    await next();

    if (context.Response.StatusCode == 404 &&
    !Path.HasExtension(context.Request.Path.Value) &&
    !context.Request.Path.Value.StartsWith("/api/"))
    {
        context.Request.Path = "/index.html";
        context.Response.StatusCode = 200;
        await next();
    }
});
```
This fixes the /timeEntry issue, but now someone types in a bogus url, the site just looks broken (a routing error is thrown if looking in developer tools)
- create an errors folder in the app/_components directory and create a 404.component.ts file in there
```
import { Component } from '@angular/core'

@Component({
    template: `
    <h1 class="errorMessage">404'd</h1>
  `,
    styles: [`
    .errorMessage { 
      margin-top:150px; 
      font-size: 170px;
      text-align: center; 
    }`]
})
export class Error404Component {
    constructor() {
    }
}
```
- add a catchall route at the end of routes.ts and route it to the 404 component
```
{ path: '**', component: Error404Component }
```
### Controlling Navigation
With routing configured, now it is time to hook up navigation and active links

Navigation is controlled using [routerLink]
- can be a one time binding if the string is static, or can be a template expression which accepts an array of values that get appended to each other.
Showing which link is active is done with the RouterLinkActive directive. This adds the active class to the a element when the route is matched.

Modify nav-bar.component.html so that is contains the necessary routerLink and routerLinkActive directives
```
<nav class="navbar navbar-inverse navbar-fixed-top">
    <div class="container">
        <div class="navbar-header">
            <a class="navbar-brand" [routerLink]="['/']" routerLinkActive="active">Time Tracker</a>
            <button class="navbar-toggle" type="button" data-toggle="collapse" data-target="#navbar">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
        </div>
        <div class="navbar-collapse collapse" id="navbar">
            <ul class="nav navbar-nav">
                <li>
                    <a [routerLink]="['/timeEntry']" routerLinkActive="active">Time Entry</a>
                </li>
                <li>
                    <a [routerLink]="['/admin', 'manageUsers']" routerLinkActive="active">Admin</a>
                </li>
            </ul>
            <ul class="nav navbar-nav navbar-right">
                <li>
                    <a>Login</a>
                </li>
            </ul>
        </div>
    </div>
</nav>
```
Also, since routerLink and routerLinkActive are being used in nav-bar, the RouterModule needs to be added to the nav-bar.module file

Finally, add some styling to nav-bar.component.css so that the li > a.active color is different.
### Lazy Loading Modules/Routes
- Install angular-router-loader so that webpack will pick up the lazy loaded route(s) and add it as the last entry for the typescript rule in webpack.config.js
- Create a _components directory under the admin folder
- Add a ManageUsers and CreateUser component
- Create _routes directory under the admin folder and add a routes.ts file to that folder
```
import { Routes } from "@angular/router";
import { ManageUsersComponent } from "../_components/manage-users/manage-users.component";
import { CreateUserComponent } from "../_components/create-user/create-user.component";

export const adminRoutes: Routes = [
    {path: 'manageUsers', component: ManageUsersComponent},
    {path: 'create', component: CreateUserComponent}
]
```
- Add new adminRoutes to admin.module using RouterModule.forChild