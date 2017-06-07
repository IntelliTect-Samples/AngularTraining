import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from "../../../_services/authentication.service";
import { Router } from "@angular/router";

@Component({
    selector: 'nav-bar',
    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {

    constructor(private authService: AuthenticationService, private router: Router) { }

    ngOnInit() {
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/']);
    }
}
