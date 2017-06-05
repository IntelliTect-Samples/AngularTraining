import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NewTimeEntryComponent } from './_components/new-time-entry/new-time-entry.component';
import { TimeEntryComponent } from './_components/time-entry/time-entry.component';
import { TimeEntryListComponent } from './_components/time-entry-list/time-entry-list.component';
import { FormatTimespanPipe } from './_pipes/format-timespan.pipe';

@NgModule({
    imports: [
        CommonModule,
        FormsModule
    ],
    declarations: [NewTimeEntryComponent, TimeEntryComponent, TimeEntryListComponent, FormatTimespanPipe],
    exports: [TimeEntryComponent]
})
export class TimeEntryModule { }
