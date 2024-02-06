import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Producto, SolicitudProductoMasivo } from '../models/producto.model';
import { HelperService } from '../helpers/helper.service';
import { BusquedaProducto } from '../models/busqueda-producto.model';
import { BusquedaPaginadaProducto } from '../models/busqueda-paginada-producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  constructor(private httpClient: HttpClient, private helperService: HelperService) { }

  getPaged(criteriosSearch:BusquedaPaginadaProducto): Observable<any> {
    const queryString = this.helperService.jsonToQueryStringSinfiltro(criteriosSearch);
    const apiUrl = `${environment.api.adm}/productos/listar-paginado?${queryString}`;
    return this.httpClient.get<any>(apiUrl);
  }

  get(criteriosSearch:BusquedaProducto): Observable<any> {
    const queryString = this.helperService.jsonToQueryString(criteriosSearch);
    const apiUrl = `${environment.api.adm}/productos/listar?${queryString}`;
    return this.httpClient.get<any>(apiUrl);
  }

  add(producto: Producto): Observable<any> {
    const apiUrl = `${environment.api.adm}/productos`;
    return this.httpClient.post<any>(apiUrl, producto);
  }

  addMasive(solicitud: SolicitudProductoMasivo): Observable<any> {
    const apiUrl = `${environment.api.adm}/productos/masivos`;
    return this.httpClient.post<any>(apiUrl, solicitud);
  }

  edit(producto: Producto): Observable<any> {
    const apiUrl = `${environment.api.adm}/productos`;
    return this.httpClient.put<any>(apiUrl, producto);
  }

  delete(producto: Producto): Observable<any> {
    const apiUrl = `${environment.api.adm}/productos/${producto.id}`;
    return this.httpClient.delete<any>(apiUrl);
  }
}
