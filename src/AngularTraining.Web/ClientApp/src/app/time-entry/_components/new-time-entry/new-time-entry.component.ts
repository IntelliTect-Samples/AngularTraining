import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TimesheetEntry } from "../../_models/timesheet-entry";
import { Project } from "../../_models/project";
import { ProjectService } from "../../_services/project.service";

@Component({
    selector: 'new-time-entry',
    templateUrl: './new-time-entry.component.html',
    styleUrls: ['./new-time-entry.component.css']
})
export class NewTimeEntryComponent implements OnInit {
    @Input() timesheetEntry: TimesheetEntry;
    @Output() createEntry = new EventEmitter();
    description: string;
    project: Project;
    totalSeconds: number;
    seconds: number;
    minutes: number;
    hours: number;
    timer: number;
    projects: Project[];
    projectId: number;

    constructor(private projectService: ProjectService) {
        this.totalSeconds = 0;
        this.timer = null;
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;
        this.projectId = 0;
    }

    ngOnInit() {
        if (this.timesheetEntry == null) {
            this.timesheetEntry = new TimesheetEntry();
        }

        this.projectService.getProjects().then(projects => this.projects = projects);
    }

    toggleTimer() {
        if (this.timer) {
            // stop timer
            clearInterval(this.timer);
            this.timer = null;
            this.hours = 0;
            this.minutes = 0;
            this.seconds = 0;
            this.totalSeconds = 0;
            // update endTime
            this.timesheetEntry.endTime = new Date();
            // update project from id
            this.timesheetEntry.project = this.projects.find(project => project.id === +this.projectId);
            this.projectId = 0;
            // emit event so others can get newly created event
            this.createEntry.emit(this.timesheetEntry);
            // create new entry again
            this.timesheetEntry = new TimesheetEntry();
            
        }
        else {
            // set startTime
            this.timesheetEntry.startTime = new Date();
            // start timer
            this.timer = +setInterval(() => {
                this.totalSeconds++;

                this.hours = Math.floor(this.totalSeconds / 3600);
                this.minutes = Math.floor((this.totalSeconds - (3600 * this.hours)) / 60);
                this.seconds = Math.floor(this.totalSeconds - ((this.minutes * 60) + (3600 * this.hours)));

            }, 1000);
        }
    }
}
