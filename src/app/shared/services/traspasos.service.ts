import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HelperService } from '../helpers/helper.service';
import { Traspaso } from '../models/traspaso.model';

@Injectable({
  providedIn: 'root'
})
export class TraspasosService {

  constructor(private httpClient: HttpClient, private helperService: HelperService) { }

  get(criteriosSearch:any): Observable<any> {
    const queryString = this.helperService.jsonToQueryString(criteriosSearch);
    const apiUrl = `${environment.api.adm}/traspasos/listar?${queryString}`;
    return this.httpClient.get<any>(apiUrl);
  }

  getDetail(id:number): Observable<any> {
    const apiUrl = `${environment.api.adm}/traspasos/listarDetalle/${id}`;
    return this.httpClient.get<any>(apiUrl);
  }

  add(traspaso: Traspaso): Observable<any> {
    const apiUrl = `${environment.api.adm}/traspasos`;
    return this.httpClient.post<any>(apiUrl, traspaso);
  }

  edit(traspaso: Traspaso): Observable<any> {
    const apiUrl = `${environment.api.adm}/traspasos`;
    return this.httpClient.put<any>(apiUrl, traspaso);
  }

  delete(traspaso: Traspaso): Observable<any> {
    const apiUrl = `${environment.api.adm}/traspasos/${traspaso.id}`;
    return this.httpClient.delete<any>(apiUrl);
  }

  finalizar(traspaso: Traspaso): Observable<any> {
    const apiUrl = `${environment.api.adm}/traspasos/finalizaciones/${traspaso.id}`;
    return this.httpClient.post<any>(apiUrl, traspaso);
  }
}
