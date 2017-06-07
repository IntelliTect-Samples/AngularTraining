import { Injectable } from '@angular/core';
import { AuthenticationService } from "./authentication.service";
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";

@Injectable()
export class AdminActivatorService implements CanActivate {

    constructor(private authService: AuthenticationService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let canPass = false;
        if (!this.authService.isAuthenticated()) {
            this.router.navigate(['/user/login'], { queryParams: { returnUrl: state.url } });
        }
        else if (this.authService.currentUser.role !== 'Administrator') {
            this.router.navigate(['/']);
        }
        else {
            canPass = true;
        }

        return canPass;
    }
}
