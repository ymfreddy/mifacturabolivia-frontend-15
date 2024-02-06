import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HelperService } from '../helpers/helper.service';
import { BusquedaPago } from '../models/busqueda-pago.model';
import { Liquidacion } from '../models/liquidacion.model';
import { Pago } from '../models/pago.model';

@Injectable({
  providedIn: 'root'
})
export class PagosService {

  constructor(private httpClient: HttpClient, private helperService: HelperService) { }

  liquidar(solicitud: Liquidacion): Observable<any> {
    const apiUrl = `${environment.api.adm}/pagos/liquidaciones`;
    return this.httpClient.post<any>(apiUrl, solicitud);
  }

  add(pago: Pago): Observable<any> {
    const apiUrl = `${environment.api.adm}/pagos`;
    return this.httpClient.post<any>(apiUrl, pago);
  }

  get(criteriosSearch:BusquedaPago): Observable<any> {
    const queryString = this.helperService.jsonToQueryString(criteriosSearch);
    const apiUrl = `${environment.api.adm}/pagos/listar?${queryString}`;
    return this.httpClient.get<any>(apiUrl);
  }

  getResumenByIdTurno(idTurno:number): Observable<any> {
    const apiUrl = `${environment.api.adm}/pagos/listar-resumen/${idTurno}`;
    return this.httpClient.get<any>(apiUrl);
  }

  getById(id:number): Observable<any> {
    const apiUrl = `${environment.api.adm}/pagos/`+id;
    return this.httpClient.get<any>(apiUrl);
  }

  delete(pago: Pago): Observable<any> {
    const apiUrl = `${environment.api.adm}/pagos/${pago.id}`;
    return this.httpClient.delete<any>(apiUrl);
  }
}
