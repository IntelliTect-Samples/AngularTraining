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
