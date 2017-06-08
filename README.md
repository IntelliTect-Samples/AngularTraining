## Add user management using Reactive Forms and role based WebAPI

Little bit about Reactive Forms
- Create a tree of Angular form control objects in the component class and bind them to native form controls elements
- form control objects are created and manipulated directly in the component class
- preserves the immutability of the data model, treating it as pure source of original values (immutable)
    - unlike template forms that use ngModel to mutate the data model directly
- Based off of ReactiveFormsModule instead of FormsModule like template driven

First, since we don't want to pass all the user data around, a UserViewModel needs to be created in a ViewModels folder. The file should look like:
```
public class UserViewModel
{
    public int Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string EmailAddress { get; set; }
    public string Password { get; set; }
    public string Roles { get; set; }
}
```
Next, let's create the the WebAPI for doing user management. In the controllers folder, create a UsersController and add the following code
```
[Route("api/[controller]")]
public class UsersController : Controller
{
    public UserManager<User> UserManager { get; }
    public UsersController(UserManager<User> userManager)
    {
        UserManager = userManager;
    }

    [HttpGet, Authorize(Roles="Administrator")]
    public async Task<IEnumerable<UserViewModel>> Get()
    {
        var users = new List<UserViewModel>();

        foreach (var user in (await UserManager.Users.ToListAsync()))
        {
            var userViewModel = new UserViewModel()
            {
                FirstName = user.FirstName,
                LastName = user.LastName,
                EmailAddress = user.Email,
                Id = user.Id,
                Roles = (await UserManager.GetRolesAsync(user)).SingleOrDefault()
            };

            users.Add(userViewModel);
        }

        return users;
    }

    [HttpPost, Authorize(Roles = "Administrator")]
    public async Task<UserViewModel> Post([FromBody]UserViewModel viewModel)
    {
        UserViewModel newUser = null;

        var user = new User
        {
            UserName = viewModel.EmailAddress,
            Email = viewModel.EmailAddress,
            FirstName = viewModel.FirstName,
            LastName = viewModel.LastName
        };

        IdentityResult identityResult = await UserManager.CreateAsync(user, viewModel.Password);

        if (identityResult.Succeeded)
        {
            newUser = new UserViewModel
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                EmailAddress = user.Email
            };
            if (viewModel.Roles != null && viewModel.Roles.Length > 0)
            {
                identityResult = await UserManager.AddToRoleAsync(user, viewModel.Roles);

                if (identityResult.Succeeded)
                {
                    newUser.Roles = (await UserManager.GetRolesAsync(user)).SingleOrDefault();
                }
            }
        }

        return newUser;
    }
}
```
Now that the API end is built out, let's build the Angular model and service that will communicate with the API. Create a _models directory in the admin section and then create a class called User that will match the UserViewModel being sent by the server.
```
export class User {
    id?: number;
    emailAddress: string;
    password: string;
    firstName: string;
    lastName: string;
    roles: string[];
}
```
Create a _services folder in the admin area and create a UserAdmin service
```
import { Injectable } from '@angular/core';
import { Http, Headers } from "@angular/http";
import { User } from "../_models/user";
import { AuthenticationService } from "../../_services/authentication.service";

@Injectable()
export class UserAdminService {

    private headers = new Headers({ 'Authorization': 'Bearer ' + this.authService.access_token });
    constructor(private http: Http, private authService: AuthenticationService) { }

    getUsers(): Promise<User[]> {
        return this.http.get('/api/users', { headers: this.headers })
            .toPromise()
            .then((response) => {
                return response.json() as User[];
            })
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }

    createUser(user: User): Promise<User> {
        this.headers.append('Content-Type', 'application/json');
        return this.http.post('/api/users', JSON.stringify(user), { headers: this.headers })
            .toPromise()
            .then((response) => {
                return response.json() as User
            })
            .catch(this.handleError);
    }
}
```
Update the admin.module and import the HttpModule and ReactiveFormsModule. Also add the UserAdminService to the providers section.

Create a UserList component in the admin/_components directory

user-list.component.html
```
<table class="table">
    <thead>
        <tr>
            <th>Id</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email Address</th>
            <th>Is Admin</th>
        </tr>
    </thead>
    <tbody>
        <tr *ngFor="let user of users">
            <td>{{user.id}}</td>
            <td>{{user.firstName}}</td>
            <td>{{user.lastName}}</td>
            <td>{{user.emailAddress}}</td>
            <td><i [ngClass]="(user.roles && user.roles.length > 0) ? 'fa fa-check' : ''"></i></td>
        </tr>
    </tbody>
</table>
```
user-list.component.ts
```
import { Component, OnInit, Input } from '@angular/core';
import { UserAdminService } from "../../_services/user-admin.service";
import { User } from "../../_models/User";

@Component({
    selector: 'user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
    @Input() users: User[];
    constructor(private userAdminService: UserAdminService) { }

    ngOnInit() {
        
    }
}
```
Update the ManageUserComponent with the following code

manage-user.component.html
```
<create-user *ngIf="addUser" (userCreated)="userCreated($event)"></create-user>
<div *ngIf="!addUser">
    <button class="btn btn-primary" (click)="addUser = true">Add User</button>
    <user-list *ngIf="!addUser" [users]="users"></user-list>
</div>
```
manage-user.component.ts
```
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { User } from "../../_models/User";
import { UserAdminService } from "../../_services/user-admin.service";

@Component({
    selector: 'manage-users',
    templateUrl: './manage-users.component.html',
    styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit {
    addUser = false;
    users: User[] = [];

    constructor(private userAdminService: UserAdminService) { }
    ngOnInit() {
        this.userAdminService.getUsers().then(response => {
            this.users = response;
        })
    }

    userCreated(user: User) {
        if (user) {
            this.users.push(user);
        }
        this.addUser = false;
    }
}
```
Update the CreateUserComponent with the following code

create-user.component.html
```
<form [formGroup]="createUserForm" (ngSubmit)="saveUser(createUserForm.value)" novalidate>
    <div class="form-group" [ngClass]="{'error': firstName.invalid && firstName.dirty}">
        <label for="firstName">First Name</label>
        <em *ngIf="firstName.invalid && firstName.dirty">Required</em>
        <input id="firstName" formControlName="firstName" type="text" class="form-control" placeholder="First Name" />
    </div>
    <div class="form-group" [ngClass]="{'error': lastName.invalid && lastName.dirty}">
        <label for="lastName">Last Name</label>
        <em *ngIf="lastName.invalid && lastName.dirty">Required</em>
        <input id="lastName" formControlName="lastName" type="text" class="form-control" placeholder="Last Name" />
    </div>
    <div class="form-group" [ngClass]="{'error': emailAddress.invalid && emailAddress.dirty}">
        <label for="emailAddress">Email Address</label>
        <em *ngIf="emailAddress.invalid && emailAddress.dirty && emailAddress?.errors.required">Required</em>
        <em *ngIf="emailAddress.invalid && emailAddress.dirty && emailAddress?.errors.email">Must be a valid email address</em>
        <input id="emailAddress" formControlName="emailAddress" type="text" class="form-control" placeholder="Email Address" />
    </div>
    <div class="form-group" [ngClass]="{'error': password.invalid && password.dirty}">
        <label for="password">Password</label>
        <em *ngIf="password.invalid && password.dirty">Required</em>
        <input id="password" formControlName="password" type="password" class="form-control" />
    </div>
    <div class="form-group">
        <label for="roles">Roles:</label>
        <select formControlName="roles" class="form-control">
            <option value="">select role...</option>
            <option value=""></option>
            <option value="Administrator">Administrator</option>
        </select>
    </div>
    <button type="submit" class="btn btn-primary" [disabled]="createUserForm.invalid">Save</button>
    <button class="btn btn-default" type="button" (click)="cancel()">Cancel</button>
</form>
```
create-user.component.ts
```
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { UserAdminService } from "../../_services/user-admin.service";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { User } from "../../_models/User";

@Component({
    selector: 'create-user',
    templateUrl: './create-user.component.html',
    styleUrls: ['./create-user.component.css']
})
export class CreateUserComponent implements OnInit {
    @Output() userCreated = new EventEmitter();
    createUserForm: FormGroup;
    firstName: FormControl;
    lastName: FormControl;
    emailAddress: FormControl;
    password: FormControl;
    roles: FormControl;

    constructor(private userAdminService: UserAdminService) { }

    ngOnInit() {
        this.firstName = new FormControl('', Validators.required);
        this.lastName = new FormControl('', Validators.required);
        this.emailAddress = new FormControl('', [Validators.required, Validators.email]);
        this.password = new FormControl('', Validators.required);
        this.roles = new FormControl('');

        this.createUserForm = new FormGroup({
            firstName: this.firstName,
            lastName: this.lastName,
            emailAddress: this.emailAddress,
            password: this.password,
            roles: this.roles
        });
    }

    saveUser(formValues: User) {
        let user: User = {
            firstName: formValues.firstName,
            lastName: formValues.lastName,
            emailAddress: formValues.emailAddress,
            password: formValues.password,
            roles: formValues.roles
        }
        let newUser: User;
        this.userAdminService.createUser(user)
            .then((result) =>
            {
                newUser = result;
                this.userCreated.emit(newUser);
            });
        
    }

    cancel() {
        this.userCreated.emit(null);
    }
}
```

### Hooking up toastr as a service
```
npm install toastr expose-loader --save-dev
```
Modify webpack.config.vendor.js and add toastr to the list of vendor modules
```
'toastr',
'toastr/build/toastr.css',
```
Modify webpack.config.js and add a new rule
```
{ test: require.resolve('toastr'), use: [{ loader: 'expose-loader', options: 'toastr' }]}
```
Create a Toastr service in the _services directory of the app
```
import { Injectable } from '@angular/core';
require('expose-loader?toastr!toastr');

declare let toastr: any;

@Injectable()
export class ToastrService {
    success(message: string, title?: string) {
        toastr.success(message, title);
    }
    info(message: string, title?: string) {
        toastr.info(message, title);
    }
    warning(message: string, title?: string) {
        toastr.warning(message, title);
    }
    error(message: string, title?: string) {
        toastr.error(message, title);
    }
}
```
Add the toastr service to the app.module in the list of providers

Inject the toastr service into the CreateUser component and on success call toastrService.success and on failure call toastrService.error