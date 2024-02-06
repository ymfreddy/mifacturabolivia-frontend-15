import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Mesa } from '../models/mesa';

@Injectable({
  providedIn: 'root'
})
export class MesasService {

  constructor(private httpClient: HttpClient) { }

  getById(id: number): Observable<any> {
    const apiUrl = `${environment.api.adm}/mesas/${id}`;
    return this.httpClient.get<any>(apiUrl);
  }

  getByIdSucursal(idSucursal: number): Observable<any> {
    const apiUrl = `${environment.api.adm}/mesas/listar-por-sucursal/${idSucursal}`;
    return this.httpClient.get<any>(apiUrl);
  }

  getAtencionByIdSucursal(idSucursal: number): Observable<any> {
    const apiUrl = `${environment.api.adm}/mesas/atenciones/${idSucursal}`;
    return this.httpClient.get<any>(apiUrl);
  }

  add(mesa: Mesa): Observable<any> {
    const apiUrl = `${environment.api.adm}/mesas`;
    return this.httpClient.post<any>(apiUrl, mesa);
  }

  edit(mesa: Mesa): Observable<any> {
    const apiUrl = `${environment.api.adm}/mesas`;
    return this.httpClient.put<any>(apiUrl, mesa);
  }

  delete(mesa: Mesa): Observable<any> {
    const apiUrl = `${environment.api.adm}/mesas/${mesa.id}`;
    return this.httpClient.delete<any>(apiUrl);
  }
}
