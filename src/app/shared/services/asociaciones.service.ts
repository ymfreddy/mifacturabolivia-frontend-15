import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HelperService } from '../helpers/helper.service';
import { Asociacion } from '../models/asociacion.model';

@Injectable({
  providedIn: 'root'
})
export class AsociacionesService {

  constructor(
    private httpClient: HttpClient,
    private helperService: HelperService,
  ) { }

  get(): Observable<any> {
    const apiUrl = `${environment.api.sfe}/asociaciones`;
    return this.httpClient.get<any>(apiUrl);
  }

  getByNit(nit:number): Observable<any> {
    const apiUrl = `${environment.api.sfe}/asociaciones/listar-por-nit/${nit}`;
    return this.httpClient.get<any>(apiUrl);
  }

  add(asociacion: Asociacion): Observable<any> {
    const apiUrl = `${environment.api.sfe}/asociaciones`;
    return this.httpClient.post<any>(apiUrl, asociacion);
  }

  edit(asociacion: Asociacion): Observable<any> {
    const apiUrl = `${environment.api.sfe}/asociaciones`;
    return this.httpClient.put<any>(apiUrl, asociacion);
  }

  delete(asociacion: Asociacion): Observable<any> {
    const apiUrl = `${environment.api.sfe}/asociaciones/${asociacion.id}`;
    return this.httpClient.delete<any>(apiUrl);
  }

  getDatosFacturacion(criteriosSearch: any): Observable<any> {
    const queryString = this.helperService.jsonToQueryString(criteriosSearch);
    const apiUrl = `${environment.api.sfe}/asociaciones/datos-facturacion?${queryString}`;
    return this.httpClient.get<any>(apiUrl);
  }

  getActividadesProductosByNit(nit:number): Observable<any> {
    const apiUrl = `${environment.api.sfe}/asociaciones/listar-actividades-productos-sin-por-nit/${nit}`;
    return this.httpClient.get<any>(apiUrl);
  }
}
