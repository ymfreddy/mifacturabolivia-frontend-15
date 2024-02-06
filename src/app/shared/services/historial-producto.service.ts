import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HelperService } from '../helpers/helper.service';
import { HistorialProducto } from '../models/historial-producto.model';

@Injectable({
  providedIn: 'root'
})
export class HistorialProductosService {

  constructor(private httpClient: HttpClient, private helperService: HelperService) { }

  getHistory(criteriosSearch:any): Observable<any> {
    const queryString = this.helperService.jsonToQueryString(criteriosSearch);
    const apiUrl = `${environment.api.adm}/historial-productos/listar?${queryString}`;
    return this.httpClient.get<any>(apiUrl);
  }

  /*getSaldos(criteriosSearch:any): Observable<any> {
    const queryString = this.helperService.jsonToQueryString(criteriosSearch);
    const apiUrl = `${environment.api.adm}/historial-productos/listar-saldos?${queryString}`;
    return this.httpClient.get<any>(apiUrl);
  }*/

  fix(historialproducto: HistorialProducto): Observable<any> {
    const apiUrl = `${environment.api.adm}/historial-productos/ajustes`;
    return this.httpClient.post<any>(apiUrl, historialproducto);
  }


}
