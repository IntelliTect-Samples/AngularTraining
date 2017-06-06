import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { TimeTrackerAppComponent } from './_components/time-tracker-app/time-tracker-app.component';
import { NavBarModule } from './nav-bar';
import { TimeEntryModule } from './time-entry';
import { RouterModule } from "@angular/router";
import { appRoutes } from "./_routes/routes";
import { Error404Component } from "./_components/errors/404.component";

@NgModule({
    imports: [
        BrowserModule,
        NavBarModule,
        TimeEntryModule,
        RouterModule.forRoot(appRoutes)
    ],
    bootstrap: [TimeTrackerAppComponent],
    declarations: [
        TimeTrackerAppComponent,
        Error404Component
    ]
})
export class AppModule { }