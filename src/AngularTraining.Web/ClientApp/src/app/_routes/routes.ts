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