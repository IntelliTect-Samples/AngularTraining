import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageUsersComponent } from './_components/manage-users/manage-users.component';
import { CreateUserComponent } from './_components/create-user/create-user.component';
import { adminRoutes } from './_routes/routes';
import { RouterModule } from "@angular/router";
import { UserAdminService } from "./_services/user-admin.service";
import { HttpModule } from "@angular/http";
import { UserListComponent } from './_components/user-list/user-list.component';
import { ReactiveFormsModule } from "@angular/forms";

@NgModule({
  imports: [
      CommonModule,
      RouterModule.forChild(adminRoutes),
      HttpModule,
      ReactiveFormsModule
  ],
  declarations: [ManageUsersComponent, CreateUserComponent, UserListComponent],
  providers: [UserAdminService]
})
export class AdminModule { }
