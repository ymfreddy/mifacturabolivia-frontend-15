import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Parametrica } from '../models/parametrica.model';

@Injectable({
  providedIn: 'root'
})
export class ParametricasService {

  constructor(private httpClient: HttpClient) { }

  getParametricasByTipo(tipo: string): Observable<Parametrica[]> {
    const apiUrl = `${environment.api.adm}/parametricas/listarPorTipo/${tipo}`;
    return this.httpClient.get<any>(apiUrl).pipe(
      map(res => {
        return res.content;
      })
    );
  }
}
