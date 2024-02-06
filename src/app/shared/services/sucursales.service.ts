import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Sucursal } from '../models/sucursal.model';

@Injectable({
  providedIn: 'root'
})
export class SucursalesService {

  constructor(private httpClient: HttpClient) { }

  getById(id: number): Observable<any> {
    const apiUrl = `${environment.api.adm}/sucursales/${id}`;
    return this.httpClient.get<any>(apiUrl);
  }

  getByIdEmpresa(empresaId: number): Observable<any> {
    const apiUrl = `${environment.api.adm}/sucursales/listar/${empresaId}`;
    return this.httpClient.get<any>(apiUrl);
  }

  get(): Observable<any> {
    const apiUrl = `${environment.api.adm}/sucursales/listar`;
    return this.httpClient.get<any>(apiUrl);
  }

  add(sucursal: Sucursal): Observable<any> {
    const apiUrl = `${environment.api.adm}/sucursales`;
    return this.httpClient.post<any>(apiUrl, sucursal);
  }

  edit(sucursal: Sucursal): Observable<any> {
    const apiUrl = `${environment.api.adm}/sucursales`;
    return this.httpClient.put<any>(apiUrl, sucursal);
  }

  delete(sucursal: Sucursal): Observable<any> {
    const apiUrl = `${environment.api.adm}/sucursales/${sucursal.id}`;
    return this.httpClient.delete<any>(apiUrl);
  }
}
