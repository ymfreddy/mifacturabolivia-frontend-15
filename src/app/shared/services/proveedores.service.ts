import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Proveedor } from '../models/proveedor.model';

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {

  constructor(private httpClient: HttpClient) { }

  getByIdEmpresa(empresaId: number): Observable<any> {
    const apiUrl = `${environment.api.adm}/proveedores/listar/${empresaId}`;
    return this.httpClient.get<any>(apiUrl);
  }

  add(proveedor: Proveedor): Observable<any> {
    const apiUrl = `${environment.api.adm}/proveedores`;
    return this.httpClient.post<any>(apiUrl, proveedor);
  }

  edit(proveedor: Proveedor): Observable<any> {
    const apiUrl = `${environment.api.adm}/proveedores`;
    return this.httpClient.put<any>(apiUrl, proveedor);
  }

  delete(proveedor: Proveedor): Observable<any> {
    const apiUrl = `${environment.api.adm}/proveedores/${proveedor.id}`;
    return this.httpClient.delete<any>(apiUrl);
  }

}
