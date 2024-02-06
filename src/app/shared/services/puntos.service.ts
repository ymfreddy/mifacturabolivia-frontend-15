import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PuntoVenta } from '../models/punto.model';

@Injectable({
  providedIn: 'root'
})
export class PuntosService {

  constructor(private httpClient: HttpClient) { }

  getById(id: number): Observable<any> {
    const apiUrl = `${environment.api.adm}/puntos/${id}`;
    return this.httpClient.get<any>(apiUrl);
  }

  get(): Observable<any> {
    const apiUrl = `${environment.api.adm}/puntos/listar`;
    return this.httpClient.get<any>(apiUrl);
  }

  getByIdEmpresa(empresaId: number): Observable<any> {
    const apiUrl = `${environment.api.adm}/puntos/listar/${empresaId}`;
    return this.httpClient.get<any>(apiUrl);
  }

  add(punto: PuntoVenta): Observable<any> {
    const apiUrl = `${environment.api.adm}/puntos`;
    return this.httpClient.post<any>(apiUrl, punto);
  }

  edit(punto: PuntoVenta): Observable<any> {
    const apiUrl = `${environment.api.adm}/puntos`;
    return this.httpClient.put<any>(apiUrl, punto);
  }

  delete(punto: PuntoVenta): Observable<any> {
    const apiUrl = `${environment.api.adm}/puntos/${punto.id}`;
    return this.httpClient.delete<any>(apiUrl);
  }
}
