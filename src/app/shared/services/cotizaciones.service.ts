import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HelperService } from '../helpers/helper.service';
import { Cotizacion } from '../models/cotizacion.model';

@Injectable({
  providedIn: 'root'
})
export class CotizacionesService {


    constructor(private httpClient: HttpClient, private helperService: HelperService) { }

    get(criteriosSearch:any): Observable<any> {
      const queryString = this.helperService.jsonToQueryString(criteriosSearch);
      const apiUrl = `${environment.api.adm}/cotizaciones/listar?${queryString}`;
      return this.httpClient.get<any>(apiUrl);
    }

    getById(id:number): Observable<any> {
      const apiUrl = `${environment.api.adm}/cotizaciones/${id}`;
      return this.httpClient.get<any>(apiUrl);
    }

    getDetail(id:number): Observable<any> {
      const apiUrl = `${environment.api.adm}/cotizaciones/listarDetalle/${id}`;
      return this.httpClient.get<any>(apiUrl);
    }

    getDetailByCorrelativo(correlativo:string, idEmpresa:number): Observable<any> {
      const apiUrl = `${environment.api.adm}/cotizaciones/listarDetallePorCorrelativo/${correlativo}/${idEmpresa}`;
      return this.httpClient.get<any>(apiUrl);
    }

    add(cotizacion: Cotizacion): Observable<any> {
      const apiUrl = `${environment.api.adm}/cotizaciones`;
      return this.httpClient.post<any>(apiUrl, cotizacion);
    }

    delete(cotizacion: Cotizacion): Observable<any> {
      const apiUrl = `${environment.api.adm}/cotizaciones/${cotizacion.id}`;
      return this.httpClient.delete<any>(apiUrl);
    }
}
