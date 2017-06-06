import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageUsersComponent } from './_components/manage-users/manage-users.component';
import { CreateUserComponent } from './_components/create-user/create-user.component';
import { adminRoutes } from './_routes/routes';
import { RouterModule } from "@angular/router";

@NgModule({
  imports: [
      CommonModule,
      RouterModule.forChild(adminRoutes)
  ],
  declarations: [ManageUsersComponent, CreateUserComponent]
})
export class AdminModule { }
