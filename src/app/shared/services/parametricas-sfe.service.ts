import { ActividadSfe } from './../models/actividad-sfe.model';
import { ParametricaSfe } from './../models/parametrica-sfe.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ProductoSfe } from '../models/producto-sfe.model';

@Injectable({
  providedIn: 'root'
})
export class ParametricasSfeService {

  constructor(private httpClient: HttpClient) { }

  private getParametricasByTipo(tipo: number): Observable<ParametricaSfe[]> {
    const apiUrl = `${environment.api.sfe}/parametricas/listar-por-tipo/${tipo}`;
    return this.httpClient.get<any>(apiUrl).pipe(
      map(res => {
        return res.content;
      })
    );
  }

  getTipoDocumento(): Observable<ParametricaSfe[]> {
    return this.getParametricasByTipo(1);
  }

  getTipoMetodoPago(): Observable<ParametricaSfe[]> {
    return this.getParametricasByTipo(10);
  }

  getTipoMoneda(): Observable<ParametricaSfe[]> {
    return this.getParametricasByTipo(11);
  }

  getTipoUnidad(): Observable<ParametricaSfe[]> {
    return this.getParametricasByTipo(13);
  }

  getTipoPais(): Observable<ParametricaSfe[]> {
    return this.getParametricasByTipo(7);
  }

  getMotivoAnulacion(): Observable<ParametricaSfe[]> {
    return this.getParametricasByTipo(6);
  }

  getTipoEmision(): Observable<ParametricaSfe[]> {
    return this.getParametricasByTipo(3);
  }

  getTipoPuntoVenta(): Observable<ParametricaSfe[]> {
    return this.getParametricasByTipo(12);
  }

  getTipoModalidad(): Observable<ParametricaSfe[]> {
    return this.getParametricasByTipo(2);
  }

  getTipoEvento(): Observable<ParametricaSfe[]> {
    return this.getParametricasByTipo(5);
  }

  getTipoHabitacion(): Observable<ParametricaSfe[]> {
    return this.getParametricasByTipo(9);
  }

  getActividades(nitEmpresa:number): Observable<ActividadSfe[]> {
    const apiUrl = `${environment.api.sfe}/parametricas/actividades/${nitEmpresa}`;
    return this.httpClient.get<any>(apiUrl).pipe(
      map(res => {
        return res.content;
      })
    );
  }

  getProductosSin(nitEmpresa:number): Observable<ProductoSfe[]> {
    const apiUrl = `${environment.api.sfe}/parametricas/productos/${nitEmpresa}`;
    return this.httpClient.get<any>(apiUrl).pipe(
      map(res => {
        return res.content;
      })
    );
  }
}
