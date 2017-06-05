import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewTimeEntryComponent } from './_components/new-time-entry/new-time-entry.component';
import { TimeEntryComponent } from './_components/time-entry/time-entry.component';
import { TimeEntryListComponent } from './_components/time-entry-list/time-entry-list.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [NewTimeEntryComponent, TimeEntryComponent, TimeEntryListComponent],
  exports: [TimeEntryComponent]
})
export class TimeEntryModule { }
