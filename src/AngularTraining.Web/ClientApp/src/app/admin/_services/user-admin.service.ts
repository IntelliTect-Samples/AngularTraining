import { Injectable } from '@angular/core';
import { Http, Headers } from "@angular/http";
import { User } from "../_models/user";
import { AuthenticationService } from "../../_services/authentication.service";

@Injectable()
export class UserAdminService {

    private headers = new Headers({ 'Authorization': 'Bearer ' + this.authService.access_token });
    constructor(private http: Http, private authService: AuthenticationService) { }

    getUsers(): Promise<User[]> {
        return this.http.get('/api/users', { headers: this.headers })
            .toPromise()
            .then((response) => {
                return response.json() as User[];
            })
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }

    createUser(user: User): Promise<User> {
        this.headers.append('Content-Type', 'application/json');
        return this.http.post('/api/users', JSON.stringify(user), { headers: this.headers })
            .toPromise()
            .then((response) => {
                return response.json() as User
            })
            .catch(this.handleError);
    }
}