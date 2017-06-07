## Add WebAPI Backend
Create the following "repository interfaces" IClientRepository, IProjectRepository, ITimesheetEntryRepository
```
public interface I{Type}Repository : IRepository<Type>
{
}
```
Create the following "repositories" ClientRepository, ProjectRepository, TimesheetEntryRepository
```
public class {Type}Repository: RepositoryBase<Type>, IRepository{Type}
{
    public {Type}Repository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }
}
```
Update InitializeData to add Projects and Clients to the database if they don't already exist
```
if (!context.Clients.Any())
{
    context.Clients.Add(new Client { Name = "Contoso, Inc" });
    context.Clients.Add(new Client { Name = "Adventureworks" });

    context.SaveChanges();
}

if (!context.Projects.Any())
{
    context.Projects.Add(new Project { Title = "Angular Training", ClientId = context.Clients.SingleOrDefault(client => client.Name == "Contoso, Inc").Id });
    context.Projects.Add(new Project { Title = "Biztalk", ClientId = context.Clients.SingleOrDefault(client => client.Name == "Adventureworks").Id });

    context.SaveChanges();
}
```
In startup, add to DI via the services.AddScoped

Create TimesheetEntryController and ProjectController in Controllers folder
```
public class TimesheetEntryController : Controller
{
    public ITimesheetEntryRepository TimesheetRepository { get; }
    public TimesheetEntryController(ITimesheetEntryRepository timesheetRepository)
    {
        TimesheetRepository = timesheetRepository;
    }

    [HttpGet, Authorize]
    public IEnumerable<TimesheetEntry> Get()
    {
        var userId = Convert.ToInt32(User.FindFirst(OpenIdConnectConstants.Claims.Subject).Value);

        var timesheetEntries = TimesheetRepository.AllIncluding(t => t.Project, t => t.Project.Client).Where(t => t.UserId == userId).OrderByDescending(t => t.EndTime);

        return timesheetEntries;
    }

    [HttpPost, Authorize]
    public async Task<TimesheetEntry> Post([FromBody]TimesheetEntry timesheetEntry)
    {
        var userId = Convert.ToInt32(User.FindFirst(OpenIdConnectConstants.Claims.Subject).Value);
        timesheetEntry.UserId = userId;
        timesheetEntry.ProjectId = timesheetEntry.Project.Id;
        timesheetEntry.Project = null;

        TimesheetRepository.InsertOrUpdate(timesheetEntry);
        await TimesheetRepository.SaveAsync();

        var updatedEntry = await TimesheetRepository.AllIncluding(t => t.Project, t => t.Project.Client).SingleOrDefaultAsync(t => t.Id == timesheetEntry.Id);

        return updatedEntry;
    }
}
```
```
public class ProjectController : Controller
{
    public IProjectRepository ProjectRepository { get; }
    public ProjectController(IProjectRepository projectRepository)
    {
        ProjectRepository = projectRepository;
    }

    [HttpGet]
    public IEnumerable<Project> Get()
    {
        return ProjectRepository.AllIncluding(p => p.Client);
    }
}
```

Create TimesheetEntryService and ProjectService in time-entry/_services directory
```
ng g service time-entry/_services/TimesheetEntry
ng g service time-entry/_services/Project
```
Add TimesheetEntryService and ProjectService to providers section of time-entry.module

```
import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from "@angular/http";
import { AuthenticationService } from "../../_services/authentication.service";
import { TimesheetEntry } from "../_models/timesheet-entry";
import 'rxjs/add/operator/toPromise';

@Injectable()
export class TimesheetEntryService {

    private headers = new Headers({ 'Authorization': 'Bearer ' + this.authService.access_token });
    constructor(private http: Http, private authService: AuthenticationService) { }

    getTimesheetEntries(): Promise<TimesheetEntry[]> {
        return this.http.get('/api/timesheetentry', {headers: this.headers})
            .toPromise()
            .then((response) => {
                return response.json() as TimesheetEntry[];
            })
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }

    insertTimesheetEntry(timesheetEntry: TimesheetEntry): Promise<TimesheetEntry> {
        this.headers.append('Content-Type', 'application/json');
        return this.http
            .post('/api/timesheetentry', JSON.stringify(timesheetEntry), { headers: this.headers })
            .toPromise()
            .then(response => response.json() as TimesheetEntry)
            .catch(this.handleError);
    }
}
```
```
import { Injectable } from '@angular/core';
import { Project } from "../_models/project";
import { Http } from "@angular/http";
import 'rxjs/add/operator/toPromise';

@Injectable()
export class ProjectService {

    constructor(private http: Http) { }

    getProjects(): Promise<Project[]> {
        return this.http.get('/api/project')
            .toPromise()
            .then((response) => {
                return response.json() as Project[];
            })
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }

}
```
Update time-entry.component.ts to pull data from the database and to save the entry to the database
```
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
```
update new-time-entry.component.ts to pull project data from the database
```
this.projectService.getProjects().then(projects => this.projects = projects);
```