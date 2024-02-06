import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BusquedaSugerenciaAsignacion, BusquedaZona, Interesado } from '../models/interesado.model';
import { HelperService } from 'src/app/shared/helpers/helper.service';
import { BusquedaPaginada } from '../models/busqueda-paginada.model';

@Injectable({
  providedIn: 'root'
})
export class InteresadosService {

  constructor(private httpClient: HttpClient, private helperService: HelperService) { }

  getPaged(criteriosSearch:BusquedaPaginada): Observable<any> {
    const queryString = this.helperService.jsonToQueryStringSinfiltro(criteriosSearch);
    const apiUrl = `${environment.api.adm}/interesados/listar-paginado?${queryString}`;
    return this.httpClient.get<any>(apiUrl);
  }

  getById(id:number): Observable<any> {
    const apiUrl = `${environment.api.adm}/interesados/${id}`;
    return this.httpClient.get<any>(apiUrl);
  }

  add(interesado: Interesado): Observable<any> {
    const apiUrl = `${environment.api.adm}/interesados`;
    return this.httpClient.post<any>(apiUrl, interesado);
  }

  edit(interesado: Interesado): Observable<any> {
    const apiUrl = `${environment.api.adm}/interesados`;
    return this.httpClient.put<any>(apiUrl, interesado);
  }

  delete(interesado: Interesado): Observable<any> {
    const apiUrl = `${environment.api.adm}/interesados/${interesado.id}`;
    return this.httpClient.delete<any>(apiUrl);
  }

  getAddress(id:number): Observable<any> {
    const apiUrl = `${environment.api.adm}/interesados/listar-direcciones/${id}`;
    return this.httpClient.get<any>(apiUrl);
  }

  getAddressPaged(criteriosSearch:BusquedaPaginada): Observable<any> {
    const queryString = this.helperService.jsonToQueryStringSinfiltro(criteriosSearch);
    const apiUrl = `${environment.api.adm}/interesados/listar-direcciones-paginado?${queryString}`;
    return this.httpClient.get<any>(apiUrl);
  }

  getZones(criteriosSearch: BusquedaZona): Observable<any> {
    const queryString = this.helperService.jsonToQueryStringSinfiltro(criteriosSearch);
    const apiUrl = `${environment.api.adm}/interesados/listar-zonas?${queryString}`;
    return this.httpClient.get<any>(apiUrl);
  }

  getSuggestions(criteriosSearch: BusquedaSugerenciaAsignacion): Observable<any> {
    const queryString = this.helperService.jsonToQueryString(criteriosSearch);
    const apiUrl = `${environment.api.adm}/interesados/listar-sugerencias-asignacion?${queryString}`;
    return this.httpClient.get<any>(apiUrl);
  }

}
