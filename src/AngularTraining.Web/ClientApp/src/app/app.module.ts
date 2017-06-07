import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { TimeTrackerAppComponent } from './_components/time-tracker-app/time-tracker-app.component';
import { NavBarModule } from './nav-bar';
import { TimeEntryModule } from './time-entry';
import { RouterModule } from "@angular/router";
import { appRoutes } from "./_routes/routes";
import { Error404Component } from "./_components/errors/404.component";
import { AuthenticationService } from "./_services/authentication.service";
import { HttpModule } from "@angular/http";
import { AuthActivatorService } from "./_services/auth-activator.service";
import { AdminActivatorService } from "./_services/admin-activator.service";
import { HomeComponent } from './home/home.component';

@NgModule({
    imports: [
        BrowserModule,
        NavBarModule,
        TimeEntryModule,
        HttpModule,
        RouterModule.forRoot(appRoutes)
    ],
    bootstrap: [TimeTrackerAppComponent],
    declarations: [
        TimeTrackerAppComponent,
        Error404Component,
        HomeComponent
    ],
    providers: [AuthenticationService, AuthActivatorService, AdminActivatorService]
})
export class AppModule { }
