import { Component, OnInit } from '@angular/core';
import { TimesheetEntry } from "../../_models/timesheet-entry";
import { TimesheetEntryService } from "../../_services/timesheet-entry.service";

@Component({
    selector: 'time-entry',
    templateUrl: './time-entry.component.html',
    styleUrls: ['./time-entry.component.css']
})
export class TimeEntryComponent implements OnInit {
    timesheetEntries: TimesheetEntry[];
    timesheetEntry: TimesheetEntry;

    constructor(private timesheetEntryService: TimesheetEntryService) { }

    ngOnInit() {
        this.timesheetEntryService.getTimesheetEntries()
            .then((timeEntries) => {
                this.timesheetEntries = timeEntries;
                for (let entry of this.timesheetEntries) {
                    entry.endTime = new Date(entry.endTime);
                    entry.startTime = new Date(entry.startTime);
                }
            });
    }

    saveEntry(entry: TimesheetEntry) {
        this.timesheetEntryService.insertTimesheetEntry(entry).then((timeEntry) => {
            timeEntry.endTime = new Date(timeEntry.endTime);
            timeEntry.startTime = new Date(timeEntry.startTime);
            this.timesheetEntries.splice(0, 0, timeEntry);
        });
    }
}
