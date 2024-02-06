import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HelperService } from '../helpers/helper.service';
import { TurnoCierre } from '../models/turno.model';
import { TurnoApertura } from '../models/turno-apertura.model';
import { BusquedaTurno } from '../models/busqueda-turno.model';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {

  constructor(private httpClient: HttpClient, private helperService: HelperService) { }

  get(criteriosSearch:BusquedaTurno): Observable<any> {
    const queryString = this.helperService.jsonToQueryString(criteriosSearch);
    const apiUrl = `${environment.api.adm}/turnos/listar?${queryString}`;
    return this.httpClient.get<any>(apiUrl);
  }

  getById(id:number): Observable<any> {
    const apiUrl = `${environment.api.adm}/turnos/`+id;
    return this.httpClient.get<any>(apiUrl);
  }

  open(turno: TurnoApertura): Observable<any> {
    const apiUrl = `${environment.api.adm}/turnos/aperturas`;
    return this.httpClient.post<any>(apiUrl, turno);
  }

  close(turno: TurnoCierre): Observable<any> {
    const apiUrl = `${environment.api.adm}/turnos/cierres`;
    return this.httpClient.post<any>(apiUrl, turno);
  }
}
