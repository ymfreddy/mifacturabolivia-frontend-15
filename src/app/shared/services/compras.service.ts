import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HelperService } from '../helpers/helper.service';
import { Compra } from '../models/compra.model';

@Injectable({
  providedIn: 'root'
})
export class ComprasService {

  constructor(private httpClient: HttpClient, private helperService: HelperService) { }

  get(criteriosSearch:any): Observable<any> {
    const queryString = this.helperService.jsonToQueryString(criteriosSearch);
    const apiUrl = `${environment.api.adm}/compras/listar?${queryString}`;
    return this.httpClient.get<any>(apiUrl);
  }

  getDetail(id:number): Observable<any> {
    const apiUrl = `${environment.api.adm}/compras/listarDetalle/${id}`;
    return this.httpClient.get<any>(apiUrl);
  }

  add(compra: Compra): Observable<any> {
    const apiUrl = `${environment.api.adm}/compras`;
    return this.httpClient.post<any>(apiUrl, compra);
  }

  edit(compra: Compra): Observable<any> {
    const apiUrl = `${environment.api.adm}/compras`;
    return this.httpClient.put<any>(apiUrl, compra);
  }

  delete(compra: Compra): Observable<any> {
    const apiUrl = `${environment.api.adm}/compras/${compra.id}`;
    return this.httpClient.delete<any>(apiUrl);
  }

  finalizar(compra: any): Observable<any> {
    const apiUrl = `${environment.api.adm}/compras/recepciones`;
    return this.httpClient.post<any>(apiUrl, compra);
  }
}
