import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot
} from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root',
})
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean {
        const user = this.authService.isLoggedIn();
        if(user){
            if (!this.authService.validateToken()) {
                console.log('token expirado');
                this.router.navigate(['/auth/error']);
                return false;
            }else {
                return true;
            }
        }
        return false;
    }

    /*canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> {
        return this.authService.isLoggedIn().pipe(
            take(1),
            map((isLoggedIn: boolean) => {
                console.log(isLoggedIn);
                if (!this.authService.validateToken()) {
                    console.log('token expirado');
                    this.router.navigate(['/auth/error']);
                    return false;
                }
                if (!isLoggedIn) {
                    this.router.navigate(['/auth/access']);
                    return false;
                }
                return true;
            })
        );
    }*/
}
