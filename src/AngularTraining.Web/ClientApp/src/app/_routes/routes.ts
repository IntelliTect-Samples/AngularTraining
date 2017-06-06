import { Routes } from '@angular/router';
import { TimeEntryComponent } from "../time-entry";
import { Error404Component } from "../_components/errors/404.component";

export const appRoutes: Routes = [
    { path: 'timeEntry', component: TimeEntryComponent },
    { path: 'admin', loadChildren: '../admin/admin.module#AdminModule' },
    { path: '', redirectTo: '/timeEntry', pathMatch: 'full' },
    { path: '**', component: Error404Component }
]