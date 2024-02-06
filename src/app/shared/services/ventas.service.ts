import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HelperService } from '../helpers/helper.service';
import { FinalizarVenta } from '../models/finalizar-venta.model';
import { SolicitudVentaOnline, Venta } from '../models/venta.model';


@Injectable({
  providedIn: 'root'
})
export class VentasService {

  constructor(private httpClient: HttpClient, private helperService: HelperService) { }

  get(criteriosSearch:any): Observable<any> {
    const queryString = this.helperService.jsonToQueryString(criteriosSearch);
    const apiUrl = `${environment.api.adm}/ventas/listar?${queryString}`;
    return this.httpClient.get<any>(apiUrl);
  }

  getById(id:number): Observable<any> {
    const apiUrl = `${environment.api.adm}/ventas/${id}`;
    return this.httpClient.get<any>(apiUrl);
  }

  getDetail(id:number): Observable<any> {
    const apiUrl = `${environment.api.adm}/ventas/listarDetalle/${id}`;
    return this.httpClient.get<any>(apiUrl);
  }

  getDetailByCorrelativo(correlativo:string, idEmpresa:number): Observable<any> {
    const apiUrl = `${environment.api.adm}/ventas/listarDetallePorCorrelativo/${correlativo}/${idEmpresa}`;
    return this.httpClient.get<any>(apiUrl);
  }

  add(venta: Venta): Observable<any> {
    const apiUrl = `${environment.api.adm}/ventas`;
    return this.httpClient.post<any>(apiUrl, venta);
  }

  addOnline(venta: SolicitudVentaOnline): Observable<any> {
    const apiUrl = `${environment.api.adm}/ventas/online`;
    return this.httpClient.post<any>(apiUrl, venta);
  }


  finalize(venta: FinalizarVenta): Observable<any> {
    const apiUrl = `${environment.api.adm}/ventas/finalizaciones`;
    return this.httpClient.post<any>(apiUrl, venta);
  }

  edit(venta: Venta): Observable<any> {
    const apiUrl = `${environment.api.adm}/ventas`;
    return this.httpClient.put<any>(apiUrl, venta);
  }

  delete(venta: Venta): Observable<any> {
    const apiUrl = `${environment.api.adm}/ventas/${venta.id}`;
    return this.httpClient.delete<any>(apiUrl);
  }

  devolucion(venta: Venta): Observable<any> {
    const apiUrl = `${environment.api.adm}/ventas/devoluciones/${venta.id}`;
    return this.httpClient.put<any>(apiUrl, venta);
  }

  getDataFacturacion(id:number): Observable<any> {
    const apiUrl = `${environment.api.adm}/ventas/datos-facturacion/${id}`;
    return this.httpClient.get<any>(apiUrl);
  }

}
