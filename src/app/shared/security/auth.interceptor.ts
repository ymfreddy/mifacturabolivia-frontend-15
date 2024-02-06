import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpResponse,
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor( private router: Router) {}

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        return next.handle(this.addAuthToken(request)).pipe(
	        tap(event => {
	          if (event instanceof HttpResponse) {
	            //console.log(" all looks good: "+request.url);
	            //console.log(event.status);
	          }
	        }, error => {
                if (error.status===403){
                    this.router.navigate(['/auth/error']);
                    console.error(JSON.stringify(error.error));
                }
	        })
	      )
    }

    addAuthToken(request: HttpRequest<any>) {
        if (this.getUrlWithoutToken().includes(request.url)){
            return request;
        }

        const accessToken = sessionStorage.getItem('wx-jwtoken');
            return request.clone({
                headers: request.headers.set(
                    'Authorization',
                    `Bearer ${accessToken}`
                ),
            });
      }


    getUrlWithoutToken(): string[] {
        return ['/adm/api/v1/login'];
    }
}
