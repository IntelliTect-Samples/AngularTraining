## Build out main Time Entry functionality

Create _models directory under time-entry directory
Create models for Client, Project, and TimesheetEntry using
```
ng g class time-entry/_models/<ModelName>
```

Open TimesheetEntry and add the following fields
```
id: number;
description: string;
project: Project;
startTime: Date;
endTime: Date;
```
Open Project and add the following fields
```
id: number;
title: string;
client: Client;
```
Open Client and add the following fields
```
id: number;
name: string;
```

First, let's make it so we can display a list of hard coded project entries
- Modify time-entry-list.component.html to look like the following
  - notice the best practice of using the safe navigator operator (?.)
```
<div class="row" *ngFor="let timeEntry of timesheetEntries">
    <div class="col-md-6">
        <span>{{timeEntry.description}}</span>
    </div>
    <div class="col-md-3">
        <span>{{timeEntry?.project?.title}} - {{timeEntry?.project?.client?.name}}</span>
    </div>
    <div class="col-md-1">
        <span>{{timeSpan(timeEntry.startTime, timeEntry.endTime)}}</span>
    </div>
    <div class="col-md-1">
        <i class="fa fa-2x fa-play-circle" style="color: green"></i>
    </div>
</div>
```
Modify time-entry-list.component.ts to add the logic
- add the timesheetEntries property and mark it as input since it needs to get passed in
```
@Input() timesheetEntries: TimesheetEntry[];
```
- add the timeSpan method to format the timespan correctly (this will later be converted to a pipe)
```
timeSpan(startTime: Date, endTime: Date) {
    var timespan = endTime.valueOf() - startTime.valueOf();

    var totalSeconds = timespan / 1000;

    var hours = Math.floor(totalSeconds / 3600);
    var minutes = Math.floor((totalSeconds - (3600 * hours)) / 60);
    var seconds = Math.floor(totalSeconds - ((minutes * 60) + (3600 * hours)));

    return `${hours}:${minutes > 9 ? "" + minutes : "0" + minutes}:${seconds > 9 ? "" + seconds : "0" + seconds}`;
}
```
Add dummy data to time-entry.component.ts so there is something to be added to the time-entry-list
- create timesheetEntries property on TimeEntryComponent
- populate it with data in the ngOnInit function (this will later be replaced with data coming from an api, which is why we are not putting it in the constructor - utilizing the OnInit lifetime cycle event)
```
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
```
Modify time-entry.component.html to pass timesheetEntries to time-entry-list
```
<time-entry-list [timesheetEntries]="timesheetEntries"></time-entry-list>
```

Now let's build out the piece to actually allow us to add new time entries
Open new-time-entry.component.html file and add the following html
```
<div class="row">
    <div class="col-md-6">
        <input type="text" [(ngModel)]="timesheetEntry.description" id="description" name="description" placeholder="Whatcha up to?" />
    </div>
    <div class="col-md-3">
        <input type="text" [(ngModel)]="timesheetEntry.project" id="project" name="project" placeholder="+ Project" />
    </div>
    <div class="col-md-1">
        {{hours}}:{{minutes | number:'2.0-0'}}:{{seconds | number:'2.0-0'}}
    </div>
    <div class="col-md-1">
        <i class="fa fa-2x" [ngClass]="timer == null ? 'fa-play-circle': 'fa-stop-circle'" [style.color]="timer == null ? 'green' : 'red'" (click)="toggleTimer()"></i>
    </div>
</div>
```

Now that we are using ngModel, we need to add @angular/forms to npm, add it to the webpack.config.vendor.js file and then reference the FormsModule from the time-entry.module
```
npm install @angular/forms --save-dev
```

Modify the new-time-entry.component.ts file as follows
- Add @Input for timesheetEntry
- Create the following fields that will be needed for keeping track of time
```
@Input() timesheetEntry: TimesheetEntry;
description: string;
project: Project;
totalSeconds: number;
seconds: number;
minutes: number;
hours: number;
timer: number;
```
- Update the constructor to initialize the new properties
```
constructor() {
    this.totalSeconds = 0;
    this.timer = null;
    this.hours = 0;
    this.minutes = 0;
    this.seconds = 0;
}
```
- Update the code in ngOnInit to check and see if a timesheetEntry was passed in. If one wasn't, then create a new instance
```
ngOnInit() {
    if (this.timesheetEntry == null) {
        this.timesheetEntry = new TimesheetEntry();
    }
}
```
- implement the toggleTimer method
    - if there is a timer object, then we need to stop the timer and set things back to default values and save off the timesheetEntry item
    - else need to start a new timer
```
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
        console.log(this.timesheetEntry);
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
```
- Update toggleTimer to publish newly created timesheetEntry back to parent component
  - create new EventEmitter property and designate it as an @Output()
  - emit createEvent instead of logging to console
```
@Output() createEntry = new EventEmitter();
...
toggleTimer() {
   if (this.timer) {
      ...
      this.createEntry.emit(this.timesheetEntry);
      ...
   }
}
```
- Update time-entry.component.html to listen for createEntry event
  - note that the parameter for the event is a generic $event parameter. It must be this
```
<new-time-entry [timesheetEntry]="timesheetEntry" (createEntry)="saveEntry($event)"></new-time-entry>
```
- Implement saveEntry on time-entry.component.ts. Notice here the parameter is strongly typed and named whatever makes sense to the implementer
```
saveEntry(entry: TimesheetEntry) {
    this.timesheetEntries.splice(0, 0, entry);
}
```
- Hook up Project
  - Create projects array in new-time-entry.component.ts
  - Add a new projectId variable to bind the selected value to
  - *ngFor on the projects array to get the list of options for new-time-entry.component.html
  - when saving off, get the appropriate project from the projects array based on the projectId and set that to the timesheetEntry.project
```
...
projects: Project[];
projectId: number;

...
ngOnInit() {
    ...
    this.projects = [
        {
            id: 1,
            title: 'Angular Training',
            client: {
                id: 1,
                name: 'Contoso, Inc'
            }
        },
        {
            id: 2,
            title: 'Biztalk',
            client: {
                id: 2,
                name: 'AdventureWorks'
            }
        }
    ]
}
...
toggleTimer() {
    if (this.timer) {
        ...
        this.timesheetEntry.project = this.projects.find(project => project.id === +this.projectId);
        this.projectId = 0;
    }
}
```
```
<select [(ngModel)]="projectId" id="projectId" name="projectId">
    <option value="0"></option>
    <option *ngFor="let project of projects" value="{{project.id}}">{{project.title}} - {{project.client?.name}}</option>
</select>
```
Cleanup original time-entry-list code and use a custom pipe for displaying the timespan instead of function on the component
- create _pipes folder under time-entry directory
- use angular cli to generate stub for pipe (delete spec file that was generated)
- update transform method with logic from timeSpan method in time-entry-list.component.ts
```
transform(value: number): string {
    var totalSeconds = value / 1000;

    var hours = Math.floor(totalSeconds / 3600);
    var minutes = Math.floor((totalSeconds - (3600 * hours)) / 60);
    var seconds = Math.floor(totalSeconds - ((minutes * 60) + (3600 * hours)));

    return `${hours}:${minutes > 9 ? "" + minutes : "0" + minutes}:${seconds > 9 ? "" + seconds : "0" + seconds}`;
}
```
- update time-entry-list.component.html to use new pipe
```
<span>{{timeEntry.endTime - timeEntry.startTime | formatTimespan}}</span>
```
