## Add Authentication and Authorization
Add AngularTraining.Domain project
- should just pull from github repo, not much to explain on this one

Create a NuGet.config file at the solution level
```
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <packageSources>
    <add key="nuget.org" value="https://api.nuget.org/v3/index.json" />
    <add key="aspnet-contrib" value="https://www.myget.org/F/aspnet-contrib/api/v3/index.json" />
  </packageSources>
</configuration>
```
Close solution and re-open it so that the nuget.config file takes effect.

Add AngularTraining.Domain as a reference in AngularTraining.Web project

Add following dependencies to AngularTraining.Web project
```
<PackageReference Include="Microsoft.AspNetCore.Mvc" Version="1.1.3" />
<PackageReference Include="AspNet.Security.OAuth.Validation" Version="1.0.0" />
<PackageReference Include="OpenIddict" Version="1.0.0-*" />
<PackageReference Include="OpenIddict.EntityFrameworkCore" Version="1.0.0-*" />
<PackageReference Include="OpenIddict.Mvc" Version="1.0.0-*" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="1.1.2" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite.Design" Version="1.1.2" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="1.1.1" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="1.1.2" />
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="1.1.2" />
```
Modifications to startup.cs
- Add configuration population
```
public IConfigurationRoot Configuration { get; }
public Startup(IHostingEnvironment env)
{
    var builder = new ConfigurationBuilder()
        .SetBasePath(env.ContentRootPath)
        .AddJsonFile("appsettings.json", optional: false)
        .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true);

    builder.AddEnvironmentVariables();
    Configuration = builder.Build();
}
```
- Add Db info, Identity requirements, configure OpenIddict, and add MVC services
```
public void ConfigureServices(IServiceCollection services)
{
    services.AddDbContext<ApplicationDbContext>(options =>
    {
        options.UseSqlite(Configuration.GetConnectionString("DefaultConnection"));
        options.UseOpenIddict<int>();
    });

    services.AddIdentity<User, Role>(o =>
    {
        o.Password.RequireDigit = false;
        o.Password.RequiredLength = 6;
        o.Password.RequireLowercase = false;
        o.Password.RequireNonAlphanumeric = false;
        o.Password.RequireUppercase = false;
    })
    .AddEntityFrameworkStores<ApplicationDbContext, int>()
    .AddDefaultTokenProviders();

    services.Configure<IdentityOptions>(options =>
    {
        options.ClaimsIdentity.UserNameClaimType = OpenIdConnectConstants.Claims.Name;
        options.ClaimsIdentity.UserIdClaimType = OpenIdConnectConstants.Claims.Subject;
        options.ClaimsIdentity.RoleClaimType = OpenIdConnectConstants.Claims.Role;
    });

    services.AddOpenIddict<int>(options =>
    {
        options.AddEntityFrameworkCoreStores<ApplicationDbContext>();
        options.AddMvcBinders();
        options.EnableTokenEndpoint("/connect/token");
        options.AllowPasswordFlow();
        options.DisableHttpsRequirement();
    });

    services.AddMvc();
}
```
- Configure identity, OpenIddict and MVC in pipeline and make call to initialized database
```
public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
{
...
app.UseIdentity();
app.UseOAuthValidation();
...
app.UseOpenIddict();
app.UseMvc();
InitializeData.Initialize(app.ApplicationServices, loggerFactory);
}
```
- Add appsettings.json file
```
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=TimeTracker.sqlite"
  }
}
```
- Create migrations (if it doesn't already exist)
    - Open Package Manager Console
    - Switch to AngularTraining.Domain project
    - type "Add-Migration InitialDb"

Add AuthorizationController
```
public class AuthorizationController : Controller
{
    public IOptions<IdentityOptions> IdentityOptions { get; }
    public SignInManager<User> SignInManager { get; }
    public UserManager<User> UserManager { get; }
    public AuthorizationController(
        IOptions<IdentityOptions> identityOptions,
        SignInManager<User> signInManager,
        UserManager<User> userManager)
    {
        IdentityOptions = identityOptions;
        SignInManager = signInManager;
        UserManager = userManager;
    }

    [HttpPost("~/connect/token"), Produces("application/json")]
    public async Task<IActionResult> Exchange(OpenIdConnectRequest request)
    {
        if (request.IsPasswordGrantType())
        {
            var user = await UserManager.FindByEmailAsync(request.Username);
            if (user == null)
            {
                return BadRequest(new OpenIdConnectResponse
                {
                    Error = OpenIdConnectConstants.Errors.InvalidGrant,
                    ErrorDescription = "The username/password is invalid."
                });
            }

            if (!await SignInManager.CanSignInAsync(user))
            {
                return BadRequest(new OpenIdConnectResponse
                {
                    Error = OpenIdConnectConstants.Errors.InvalidGrant,
                    ErrorDescription = "The specified user is not allowed to sign in."
                });
            }

            if (!await UserManager.CheckPasswordAsync(user, request.Password))
            {
                return BadRequest(new OpenIdConnectResponse
                {
                    Error = OpenIdConnectConstants.Errors.InvalidGrant,
                    ErrorDescription = "The username/password is invalid."
                });
            }

            // if we got this far, we have a valid user who was able to login

            var ticket = await CreateTicketAsync(request, user);
            return SignIn(ticket.Principal, ticket.Properties, ticket.AuthenticationScheme);
        }

        throw new InvalidOperationException("The specified grant type is not supported.");
    }

    private async Task<AuthenticationTicket> CreateTicketAsync(OpenIdConnectRequest request, User user)
    {
        // Create a new ClaimsPrincipal containing the claims that
        // will be used to create an id_token, a token or a code.
        var principal = await SignInManager.CreateUserPrincipalAsync(user);

        ((ClaimsIdentity)principal.Identity).AddClaim(new Claim(OpenIdConnectConstants.Claims.FamilyName, user.LastName));
        ((ClaimsIdentity)principal.Identity).AddClaim(new Claim(OpenIdConnectConstants.Claims.GivenName, user.FirstName));

        // Create a new authentication ticket holding the user identity.
        var ticket = new AuthenticationTicket(principal,
            new AuthenticationProperties(),
            OpenIdConnectServerDefaults.AuthenticationScheme);

        // Set the list of scopes granted to the client application.
        ticket.SetScopes(new[]
        {
            OpenIdConnectConstants.Scopes.OpenId,
            OpenIdConnectConstants.Scopes.Email,
            OpenIdConnectConstants.Scopes.Profile,
            OpenIddictConstants.Scopes.Roles
        }.Intersect(request.GetScopes()));

        ticket.SetResources("resource-server");

        // Note: by default, claims are NOT automatically included in the access and identity tokens.
        // To allow OpenIddict to serialize them, you must attach them a destination, that specifies
        // whether they should be included in access tokens, in identity tokens or in both.

        foreach (var claim in ticket.Principal.Claims)
        {
            // Never include the security stamp in the access and identity tokens, as it's a secret value.
            if (claim.Type == IdentityOptions.Value.ClaimsIdentity.SecurityStampClaimType)
            {
                continue;
            }

            var destinations = new List<string>
            {
                OpenIdConnectConstants.Destinations.AccessToken
            };

            // Only add the iterated claim to the id_token if the corresponding scope was granted to the client application.
            // The other claims will only be added to the access_token, which is encrypted when using the default format.
            if ((claim.Type == OpenIdConnectConstants.Claims.Name && ticket.HasScope(OpenIdConnectConstants.Scopes.Profile)) ||
                (claim.Type == OpenIdConnectConstants.Claims.FamilyName && ticket.HasScope(OpenIdConnectConstants.Scopes.Profile)) ||
                (claim.Type == OpenIdConnectConstants.Claims.GivenName && ticket.HasScope(OpenIdConnectConstants.Scopes.Profile)) ||
                (claim.Type == OpenIdConnectConstants.Claims.Email && ticket.HasScope(OpenIdConnectConstants.Scopes.Email)) ||
                (claim.Type == OpenIdConnectConstants.Claims.Role && ticket.HasScope(OpenIddictConstants.Claims.Roles)))
            {
                destinations.Add(OpenIdConnectConstants.Destinations.IdentityToken);
            }

            claim.SetDestinations(destinations);
        }

        return ticket;
    }
}
```
Add _services and _models folder to main app
Create Authentication service
```
ng g service _services/Authentication
```
Create User model
```
ng g class _models/User
```
Add fields to User class
```
export class User {
    firstName: string;
    lastName: string;
    role: string;
}
```

Add AuthenticationService to list of providers for app.module

install @angular/http and angular2-jwt via npm and add to webpack.config.vendor.js file.
Also add HttpModule to list of imports in app.module

Implement AuthenticationService
```
import { Injectable } from "@angular/core";
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from "rxjs";
import 'rxjs/add/operator/map';
import { JwtHelper } from 'angular2-jwt';
import { User } from "../_models/user";

@Injectable()
export class AuthenticationService {
    access_token: string;
    currentUser: User;
    private jwtHelper: JwtHelper = new JwtHelper();

    constructor(private http: Http) {
        var existingUser = JSON.parse(localStorage.getItem('currentUser'));
        this.access_token = existingUser && existingUser.access_token;
        if (existingUser && existingUser.id_token) {
            this.currentUser = new User();
            this.currentUser.firstName = this.jwtHelper.decodeToken(existingUser.id_token).given_name;
            this.currentUser.lastName = this.jwtHelper.decodeToken(existingUser.id_token).family_name;
            this.currentUser.role = this.jwtHelper.decodeToken(existingUser.id_token).role;
        }
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    login(username: string, password: string): Observable<boolean> {
        let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
        let options = new RequestOptions({ headers: headers });
        let creds = `grant_type=password&username=${username}&password=${password}&scope=openid profile roles`;

        return this.http.post('/connect/token', creds, options)
            .map((response: Response) => {
                let access_token = response.json() && response.json().access_token;
                let id_token = response.json() && response.json().id_token;

                if (access_token && id_token) {
                    this.access_token = access_token;

                    localStorage.setItem('currentUser', JSON.stringify({ username: username, access_token: access_token, id_token: id_token }));

                    this.currentUser = new User();
                    this.currentUser.firstName = this.jwtHelper.decodeToken(id_token).given_name;
                    this.currentUser.lastName = this.jwtHelper.decodeToken(id_token).family_name;
                    this.currentUser.role = this.jwtHelper.decodeToken(id_token).role;

                    return true;
                }
                else {
                    return false;
                }
            })
            .catch((err: Response | any) => {
                console.log(err);
                return Observable.throw(false);
            });
    }

    logout(): void {
        this.access_token = null;
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }
}
```
Modify _routes.ts in app directory
```
...
{ path: 'user', loadChildren: '../login/login.module#LoginModule' },
...
```

Add _components folder to login folder

Create login component
```
ng g component login/_components/Login
```
Implement login.component.html
```
<div class="col-md-6 col-md-offset-3">
    <div class="alert alert-info">
        Username: admin@timetracker.com<br />
        Password: P@ssword
    </div>
    <h2>Login</h2>
    <form name="form" (ngSubmit)="loginForm.form.valid && login(loginForm.value)" #loginForm="ngForm" novalidate>
        <div class="form-group" [ngClass]="{ 'has-error': loginForm.submitted && !loginForm.controls.username?.valid }">
            <label for="username">Username</label>
            <input type="text" class="form-control" (ngModel)="username" name="username" required />
            <div *ngIf="loginForm.submitted && !loginForm.controls.username?.valid" class="help-block">Username is required</div>
        </div>
        <div class="form-group" [ngClass]="{ 'has-error': loginForm.submitted && !loginForm.controls.password?.valid }">
            <label for="password">Password</label>
            <input type="password" class="form-control" (ngModel)="password" name="password" required />
            <div *ngIf="loginForm.submitted && !loginForm.controls.password?.valid" class="help-block">Password is required</div>
        </div>
        <div class="form-group">
            <button [disabled]="loading" class="btn btn-primary">Login</button>
            <img *ngIf="loading" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
        </div>
        <div *ngIf="error" class="alert alert-danger">{{error}}</div>
    </form>
</div>
```
Implement login.component.ts
```
import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { AuthenticationService } from "../../../_services/authentication.service";

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    loading = false;
    error = '';
    returnUrl: string;

    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
        private activatedRoute: ActivatedRoute) { }

    ngOnInit() {
        this.authenticationService.logout();
        // get return url from route parameters or default to '/'
        this.returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] || '/';
    }

    login(formValues: any) {
        this.loading = true;
        this.authenticationService.login(formValues.username, formValues.password)
            .subscribe(result => {
                if (result == true) {
                    this.router.navigateByUrl(this.returnUrl);
                }
                else {
                    this.error = 'Username or password is incorrect';
                    this.loading = false;
                }
            }, error => {
                this.error = 'Username or password is incorrect';
                this.loading = false;
            });
    }
}
```
Implement login.component.css
```
.help-block {
    font-size: 12px;
}
```
Add _routes directory to login folder

Create routes.ts
```
import { Routes } from "@angular/router";
import { LoginComponent } from "../_components/login/login.component";

export const loginRoutes: Routes = [
    { path: 'login', component: LoginComponent },
]
```
Update nav-bar.component.html
```
...
<a *ngIf="authService.isAuthenticated() && authService.currentUser.role == 'Administrator'" [routerLink]="['/admin', 'manageUsers']" routerLinkActive="active">Admin</a>
...
<a *ngIf="authService.isAuthenticated(); else login" style="cursor:pointer" (click)="authService.logout()">{{authService.currentUser.firstName}} {{authService.currentUser.lastName}}</a>
<ng-template #login><a routerLink="user/login" routerLinkActive="active">Login</a></ng-template>
```
Update nav-bar.component.ts
```
import { AuthenticationService } from "../../../_services/authentication.service";
...
constructor(private authService: AuthenticationService) { }
```
### Add guard to admin/manageUsers
Add AdminActivatorService and AuthActivatedService to _services in main app folder
```
ng g service _services/AdminActivator
ng g service _services/AuthActivator
```
Implement AdminActivator
```
import { Injectable } from '@angular/core';
import { AuthenticationService } from "./authentication.service";
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";

@Injectable()
export class AdminActivatorService implements CanActivate {

    constructor(private authService: AuthenticationService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let canPass = false;
        if (!this.authService.isAuthenticated()) {
            this.router.navigate(['/user/login'], { queryParams: { returnUrl: state.url } });
        }
        else if (this.authService.currentUser.role !== 'Administrator') {
            this.router.navigate(['/']);
        }
        else {
            canPass = true;
        }

        return canPass;
    }
}
```
Implement AuthActivator
```
import { Injectable } from '@angular/core';
import { AuthenticationService } from "./authentication.service";
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";

@Injectable()
export class AuthActivatorService implements CanActivate {

    constructor(private authService: AuthenticationService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let canPass = false;
        if (!this.authService.isAuthenticated()) {
            this.router.navigate(['/user/login'], { queryParams: { returnUrl: state.url } });
        }
        else {
            canPass = true;
        }

        return canPass;
    }
}
```
Create empty HomeComponent in app/_components
```
ng g component _components/Home
```

Update app/_routes/routes.ts to add the guards and to navigate to the home page when browsing to '/'
```
import { Routes } from '@angular/router';
import { TimeEntryComponent } from "../time-entry";
import { Error404Component } from "../_components/errors/404.component";
import { AuthActivatorService } from '../_services/auth-activator.service';
import { AdminActivatorService } from "../_services/admin-activator.service";
import { HomeComponent } from "../home/home.component";

export const appRoutes: Routes = [
    { path: 'timeEntry', component: TimeEntryComponent, canActivate: [AuthActivatorService] },
    { path: 'admin', loadChildren: '../admin/admin.module#AdminModule', canActivate: [AdminActivatorService] },
    { path: 'user', loadChildren: '../login/login.module#LoginModule' },
    { path: '', component: HomeComponent, pathMatch: 'full' },
    { path: '**', component: Error404Component }
]
```