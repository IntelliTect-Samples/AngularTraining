import { Injectable } from "@angular/core";
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from "rxjs";
import 'rxjs/add/operator/map';
import { JwtHelper } from 'angular2-jwt';
import { User } from "../_models/user";

@Injectable()
export class AuthenticationService {
    access_token: string;
    currentUser: User;
    private jwtHelper: JwtHelper = new JwtHelper();

    constructor(private http: Http) {
        var existingUser = JSON.parse(localStorage.getItem('currentUser'));
        this.access_token = existingUser && existingUser.access_token;
        if (existingUser && existingUser.id_token) {
            this.currentUser = new User();
            this.currentUser.firstName = this.jwtHelper.decodeToken(existingUser.id_token).given_name;
            this.currentUser.lastName = this.jwtHelper.decodeToken(existingUser.id_token).family_name;
            this.currentUser.role = this.jwtHelper.decodeToken(existingUser.id_token).role;
        }
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    login(username: string, password: string): Observable<boolean> {
        let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
        let options = new RequestOptions({ headers: headers });
        let creds = `grant_type=password&username=${username}&password=${password}&scope=openid profile roles`;

        return this.http.post('/connect/token', creds, options)
            .map((response: Response) => {
                let access_token = response.json() && response.json().access_token;
                let id_token = response.json() && response.json().id_token;

                if (access_token && id_token) {
                    this.access_token = access_token;

                    localStorage.setItem('currentUser', JSON.stringify({ username: username, access_token: access_token, id_token: id_token }));

                    this.currentUser = new User();
                    this.currentUser.firstName = this.jwtHelper.decodeToken(id_token).given_name;
                    this.currentUser.lastName = this.jwtHelper.decodeToken(id_token).family_name;
                    this.currentUser.role = this.jwtHelper.decodeToken(id_token).role;

                    return true;
                }
                else {
                    return false;
                }
            })
            .catch((err: Response | any) => {
                console.log(err);
                return Observable.throw(false);
            });
    }

    logout(): void {
        this.access_token = null;
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }
}