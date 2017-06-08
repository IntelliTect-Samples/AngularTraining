import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { UserAdminService } from "../../_services/user-admin.service";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { User } from "../../_models/User";
import { ToastrService } from "../../../_services/toastr.service";

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

    constructor(private userAdminService: UserAdminService, private toastrService: ToastrService) { }

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
            .then((result) => {
                newUser = result;
                this.toastrService.success('User successfully created');
                this.userCreated.emit(newUser);
            })
            .catch((error) => {
                this.toastrService.error(`Unable to create user ${error}`);
            });
        
    }

    cancel() {
        this.userCreated.emit(null);
    }
}