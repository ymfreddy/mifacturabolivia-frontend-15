import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HelperService } from '../helpers/helper.service';
import { Descuento } from '../models/descuento.model';


@Injectable({
  providedIn: 'root'
})
export class DescuentosService {

  constructor(private httpClient: HttpClient, private helperService: HelperService) { }

  get(criteriosSearch:any): Observable<any> {
    const queryString = this.helperService.jsonToQueryString(criteriosSearch);
    const apiUrl = `${environment.api.adm}/descuentos/listar?${queryString}`;
    return this.httpClient.get<any>(apiUrl);
  }

  getDetail(id:number): Observable<any> {
    const apiUrl = `${environment.api.adm}/descuentos/listarDetalle/${id}`;
    return this.httpClient.get<any>(apiUrl);
  }

  add(descuento: Descuento): Observable<any> {
    const apiUrl = `${environment.api.adm}/descuentos`;
    return this.httpClient.post<any>(apiUrl, descuento);
  }

  edit(descuento: Descuento): Observable<any> {
    const apiUrl = `${environment.api.adm}/descuentos`;
    return this.httpClient.put<any>(apiUrl, descuento);
  }

  delete(descuento: Descuento): Observable<any> {
    const apiUrl = `${environment.api.adm}/descuentos/${descuento.id}`;
    return this.httpClient.delete<any>(apiUrl);
  }

}
