import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Estudiante } from '../models/estudiante.model';
import { HelperService } from 'src/app/shared/helpers/helper.service';
import { BusquedaEstudiante } from '../models/busqueda-estudiante.model';
import { BusquedaPaginada } from '../models/busqueda-paginada.model';

@Injectable({
  providedIn: 'root'
})
export class EstudiantesService {

  constructor(private httpClient: HttpClient, private helperService: HelperService) { }

  getPaged(criteriosSearch:BusquedaPaginada): Observable<any> {
    const queryString = this.helperService.jsonToQueryStringSinfiltro(criteriosSearch);
    const apiUrl = `${environment.api.adm}/estudiantes/listar-paginado?${queryString}`;
    return this.httpClient.get<any>(apiUrl);
  }

  get(criteriosSearch:BusquedaEstudiante): Observable<any> {
    const queryString = this.helperService.jsonToQueryStringSinfiltro(criteriosSearch);
    const apiUrl = `${environment.api.adm}/estudiantes/listar?${queryString}`;
    return this.httpClient.get<any>(apiUrl);
  }

  getById(id:number): Observable<any> {
    const apiUrl = `${environment.api.adm}/estudiantes/${id}`;
    return this.httpClient.get<any>(apiUrl);
  }

  add(estudiante: Estudiante): Observable<any> {
    const apiUrl = `${environment.api.adm}/estudiantes`;
    return this.httpClient.post<any>(apiUrl, estudiante);
  }

  edit(estudiante: Estudiante): Observable<any> {
    const apiUrl = `${environment.api.adm}/estudiantes`;
    return this.httpClient.put<any>(apiUrl, estudiante);
  }

  delete(estudiante: Estudiante): Observable<any> {
    const apiUrl = `${environment.api.adm}/estudiantes/${estudiante.id}`;
    return this.httpClient.delete<any>(apiUrl);
  }

  addMasive(lista: any[]): Observable<any> {
    const apiUrl = `${environment.api.adm}/estudiantes/masivos`;
    return this.httpClient.post<any>(apiUrl, lista);
  }
}
