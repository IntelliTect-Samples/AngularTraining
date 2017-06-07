import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './_components/login/login.component';
import { loginRoutes } from './_routes/routes';
import { FormsModule } from "@angular/forms";

@NgModule({
    imports: [
      FormsModule,
      CommonModule,
      RouterModule.forChild(loginRoutes)
  ],
  declarations: [LoginComponent]
})
export class LoginModule { }
