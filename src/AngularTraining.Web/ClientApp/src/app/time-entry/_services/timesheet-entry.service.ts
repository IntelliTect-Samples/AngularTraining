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