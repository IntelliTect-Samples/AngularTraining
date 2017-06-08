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
