import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HelperService } from '../helpers/helper.service';
import { BusquedaUsuario } from '../models/busqueda-usuario.model';
import { Usuario, UsuarioClienteRegistro } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  constructor(private httpClient: HttpClient,private helperService: HelperService) { }

  get(criteriosSearch:BusquedaUsuario): Observable<any> {
    const queryString = this.helperService.jsonToQueryStringSinfiltro(criteriosSearch);
    const apiUrl = `${environment.api.adm}/usuarios/listar?${queryString}`;
    return this.httpClient.get<any>(apiUrl);
  }

  add(usuario: Usuario): Observable<any> {
    const apiUrl = `${environment.api.adm}/usuarios`;
    return this.httpClient.post<any>(apiUrl, usuario);
  }

  addClientUser(usuario: UsuarioClienteRegistro): Observable<any> {
    const apiUrl = `${environment.api.adm}/usuarios/usuarios-clientes`;
    return this.httpClient.post<any>(apiUrl, usuario);
  }

  edit(usuario: Usuario): Observable<any> {
    const apiUrl = `${environment.api.adm}/usuarios`;
    return this.httpClient.put<any>(apiUrl, usuario);
  }

  delete(usuario: Usuario): Observable<any> {
    const apiUrl = `${environment.api.adm}/usuarios/${usuario.id}`;
    return this.httpClient.delete<any>(apiUrl);
  }

  changePassword(usuario: any): Observable<any> {
    const apiUrl = `${environment.api.adm}/usuarios/actualizar-password`;
    return this.httpClient.post<any>(apiUrl, usuario);
  }

  getOptions(): Observable<any> {
    const apiUrl = `${environment.api.adm}/usuarios/listar-opciones`;
    return this.httpClient.get<any>(apiUrl);
  }
}
