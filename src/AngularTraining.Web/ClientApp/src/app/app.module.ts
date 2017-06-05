import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { TimeTrackerAppComponent } from './_components/time-tracker-app/time-tracker-app.component';
import { NavBarModule } from './nav-bar';
import { TimeEntryModule } from './time-entry';

@NgModule({
    imports: [
        BrowserModule,
        NavBarModule,
        TimeEntryModule
    ],
    bootstrap: [TimeTrackerAppComponent],
    declarations: [
        TimeTrackerAppComponent
    ]
})
export class AppModule { }