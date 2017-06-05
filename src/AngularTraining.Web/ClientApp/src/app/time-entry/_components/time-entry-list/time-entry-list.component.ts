import { Component, OnInit, Input } from '@angular/core';
import { TimesheetEntry } from "../../_models/timesheet-entry";

@Component({
    selector: 'time-entry-list',
    templateUrl: './time-entry-list.component.html',
    styleUrls: ['./time-entry-list.component.css']
})
export class TimeEntryListComponent implements OnInit {
    @Input() timesheetEntries: TimesheetEntry[];

    constructor() { }

    ngOnInit() {
    }

    timeSpan(startTime: Date, endTime: Date) {
        var timespan = endTime.valueOf() - startTime.valueOf();
    }
}
