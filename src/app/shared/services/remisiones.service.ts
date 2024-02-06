import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HelperService } from '../helpers/helper.service';
import { Remision } from '../models/remision.model';


@Injectable({
  providedIn: 'root'
})
export class RemisionesService {

  constructor(private httpClient: HttpClient, private helperService: HelperService) { }

  get(criteriosSearch:any): Observable<any> {
    const queryString = this.helperService.jsonToQueryString(criteriosSearch);
    const apiUrl = `${environment.api.adm}/remisiones/listar?${queryString}`;
    return this.httpClient.get<any>(apiUrl);
  }


  getDetail(id:number): Observable<any> {
    const apiUrl = `${environment.api.adm}/remisiones/listarDetalle/${id}`;
    return this.httpClient.get<any>(apiUrl);
  }

  add(remision: Remision): Observable<any> {
    const apiUrl = `${environment.api.adm}/remisiones`;
    return this.httpClient.post<any>(apiUrl, remision);
  }

  edit(remision: Remision): Observable<any> {
    const apiUrl = `${environment.api.adm}/remisiones`;
    return this.httpClient.put<any>(apiUrl, remision);
  }

  delete(remision: Remision): Observable<any> {
    const apiUrl = `${environment.api.adm}/remisiones/${remision.id}`;
    return this.httpClient.delete<any>(apiUrl);
  }


}
