import { Routes } from "@angular/router";
import { ManageUsersComponent } from "../_components/manage-users/manage-users.component";
import { CreateUserComponent } from "../_components/create-user/create-user.component";

export const adminRoutes: Routes = [
    {path: 'manageUsers', component: ManageUsersComponent},
    {path: 'create', component: CreateUserComponent}
]