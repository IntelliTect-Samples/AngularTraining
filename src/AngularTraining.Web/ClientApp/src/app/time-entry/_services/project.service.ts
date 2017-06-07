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