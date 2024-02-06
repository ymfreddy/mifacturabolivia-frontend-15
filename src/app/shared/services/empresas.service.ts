import { Empresa } from './../models/empresa.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResumenEmpresa } from '../models/resumen-empresa.model';

@Injectable({
  providedIn: 'root'
})
export class EmpresasService {

  constructor(
    private httpClient: HttpClient
  ) { }

  get(): Observable<any> {
    const apiUrl = `${environment.api.adm}/empresas`;
    return this.httpClient.get<any>(apiUrl);
  }

  add(empresa: Empresa): Observable<any> {
    const apiUrl = `${environment.api.adm}/empresas`;
    return this.httpClient.post<any>(apiUrl, empresa);
  }

  edit(empresa: Empresa): Observable<any> {
    const apiUrl = `${environment.api.adm}/empresas`;
    return this.httpClient.put<any>(apiUrl, empresa);
  }

  delete(empresa: Empresa): Observable<any> {
    const apiUrl = `${environment.api.adm}/empresas/${empresa.id}`;
    return this.httpClient.delete<any>(apiUrl);
  }

  getResumen(id:number): Observable<ResumenEmpresa[]> {
    const apiUrl = `${environment.api.adm}/empresas/resumenes/${id}`;
    return this.httpClient.get<any>(apiUrl).pipe(
      map(res => {
        return res.content;
      })
    );
  }
}
