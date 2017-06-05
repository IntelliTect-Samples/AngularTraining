import { Component, OnInit } from '@angular/core';
import { TimesheetEntry } from "../../_models/timesheet-entry";

@Component({
    selector: 'time-entry',
    templateUrl: './time-entry.component.html',
    styleUrls: ['./time-entry.component.css']
})
export class TimeEntryComponent implements OnInit {
    timesheetEntries: TimesheetEntry[];
    timesheetEntry: TimesheetEntry;

    constructor() { }

    ngOnInit() {
        this.timesheetEntries = [
            {
                id: 1, description: "Working on Angular Training", startTime: new Date('5/30/2017 8:00:00'), endTime: new Date('5/30/2017 14:15:00'),
                project: {
                    id: 1, title: 'Angular Training',
                    client: {
                        id: 1, name: 'Contoso, Inc'
                    }
                }
            },
            {
                id: 2, description: "Working on Angular Training", startTime: new Date('5/30/2017 10:00'), endTime: new Date('5/30/2017 12:00'),
                project: {
                    id: 1, title: 'Angular Training',
                    client: {
                        id: 1, name: 'Contoso, Inc'
                    }
                }
            },
            {
                id: 3, description: "Biztalking my brains out", startTime: new Date('5/30/2017 10:00'), endTime: new Date('5/30/2017 12:00'),
                project: {
                    id: 2, title: 'Biztalk',
                    client: {
                        id: 2, name: 'AdventureWorks'
                    }
                }
            }
        ];
    }

    saveEntry(entry: TimesheetEntry) {
        this.timesheetEntries.splice(0, 0, entry);
    }
}
