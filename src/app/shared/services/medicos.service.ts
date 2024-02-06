import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Medico } from '../models/medico.model';
import { HelperService } from 'src/app/shared/helpers/helper.service';
import { BusquedaMedico } from '../models/busqueda-medico.model';
import { BusquedaPaginada } from '../models/busqueda-paginada.model';

@Injectable({
  providedIn: 'root'
})
export class MedicosService {

  constructor(private httpClient: HttpClient, private helperService: HelperService) { }

  getPaged(criteriosSearch:BusquedaPaginada): Observable<any> {
    const queryString = this.helperService.jsonToQueryStringSinfiltro(criteriosSearch);
    const apiUrl = `${environment.api.adm}/medicos/listar-paginado?${queryString}`;
    return this.httpClient.get<any>(apiUrl);
  }

  get(criteriosSearch:BusquedaMedico): Observable<any> {
    const queryString = this.helperService.jsonToQueryStringSinfiltro(criteriosSearch);
    const apiUrl = `${environment.api.adm}/medicos/listar?${queryString}`;
    return this.httpClient.get<any>(apiUrl);
  }

  getById(id:number): Observable<any> {
    const apiUrl = `${environment.api.adm}/medicos/${id}`;
    return this.httpClient.get<any>(apiUrl);
  }

  add(medico: Medico): Observable<any> {
    const apiUrl = `${environment.api.adm}/medicos`;
    return this.httpClient.post<any>(apiUrl, medico);
  }

  edit(medico: Medico): Observable<any> {
    const apiUrl = `${environment.api.adm}/medicos`;
    return this.httpClient.put<any>(apiUrl, medico);
  }

  delete(medico: Medico): Observable<any> {
    const apiUrl = `${environment.api.adm}/medicos/${medico.id}`;
    return this.httpClient.delete<any>(apiUrl);
  }

  addMasive(lista: any[]): Observable<any> {
    const apiUrl = `${environment.api.adm}/medicos/masivos`;
    return this.httpClient.post<any>(apiUrl, lista);
  }
}
