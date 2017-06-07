import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { AuthenticationService } from "../../../_services/authentication.service";

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    loading = false;
    error = '';
    returnUrl: string;

    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
        private activatedRoute: ActivatedRoute) { }

    ngOnInit() {
        this.authenticationService.logout();
        // get return url from route parameters or default to '/'
        this.returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] || '/';
    }

    logout() {
        this.authenticationService.logout();
        this.router.navigate(['/']);
    }

    login(formValues: any) {
        this.loading = true;
        this.authenticationService.login(formValues.username, formValues.password)
            .subscribe(result => {
                if (result == true) {
                    this.router.navigateByUrl(this.returnUrl);
                }
                else {
                    this.error = 'Username or password is incorrect';
                    this.loading = false;
                }
            }, error => {
                this.error = 'Username or password is incorrect';
                this.loading = false;
            });
    }

}
