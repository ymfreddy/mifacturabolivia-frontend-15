import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Sistema } from '../models/sistema.model';

@Injectable({
  providedIn: 'root'
})
export class SistemasService {

  constructor(private httpClient: HttpClient) { }

  get(): Observable<any> {
    const apiUrl = `${environment.api.sfe}/sistemas`;
    return this.httpClient.get<any>(apiUrl);
  }
}
