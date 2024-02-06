import { User } from 'src/app/shared/models/user.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Route, Router } from '@angular/router';
import { BehaviorSubject,  Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public user!: User;
  //public loggedIn$ = new BehaviorSubject<boolean>(false); // {1}

  constructor(
    private http: HttpClient,
    private router: Router,
    private httpClient: HttpClient
  ) { }

  getSession(username: string): Observable<any> {
    const apiUrl = `${environment.api.adm}/usuarios/session/`;
    return this.http.get<any>(`${apiUrl}${username}`);
  }

  login(user: User): Observable<any> {
    const apiUrl = `${environment.api.adm}/login`;
    return this.httpClient.post<any>(apiUrl, { username: user.username, password: user.password });
  }

  logout(): void {
    this.router.navigate(['']);
    this.removeSessionData();
    //window.location.reload();
    setTimeout(()=>{
        window.location.reload();
      }, 500)
    //this.loggedIn$.next(false);
  }

  isAuthenticated(){
    return this.isLoggedIn;
  }

  isLoggedIn(): boolean {
    const userLogged = sessionStorage.getItem('wx-user');
    return userLogged != null;
  }

  validateToken(): boolean {
    if (sessionStorage.getItem('wx-jwtoken')==null){
        return false;
    }

    const userToken = sessionStorage.getItem('wx-jwtoken')?? '{}';
    if (userToken.length < 2) {
      return false;
    }

    const fechaToken = JSON.parse(atob(userToken.split('.')[1])).exp;
    const expirado = Math.floor(new Date().getTime() / 1000) < fechaToken;
    return expirado;
  }

  setSessionData(res: any) {
    sessionStorage.setItem('wx-user', this.user.username);
    sessionStorage.setItem('wx-jwtoken', res.content?.token);
  }

  removeSessionData() {
     sessionStorage.removeItem('wx-jwtoken');
     sessionStorage.removeItem('wx-user');
     sessionStorage.removeItem('wx-user-data');
     sessionStorage.removeItem('wx-menu');
     sessionStorage.removeItem('wx-venta-list');
     sessionStorage.removeItem('wx-compra-list');
     sessionStorage.removeItem('wx-fcv-list');
  }
}
