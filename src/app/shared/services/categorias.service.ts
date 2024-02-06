import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HelperService } from '../helpers/helper.service';
import { BusquedaCategoria } from '../models/busqueda-ccategoria.model';
import { Categoria } from '../models/categoria.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {

  constructor(private httpClient: HttpClient, private helperService: HelperService) { }

  get(criteriosSearch:BusquedaCategoria): Observable<any> {
    const queryString = this.helperService.jsonToQueryStringSinfiltro(criteriosSearch);
    const apiUrl = `${environment.api.adm}/categorias/listar?${queryString}`;
    return this.httpClient.get<any>(apiUrl);
  }

  add(categoria: Categoria): Observable<any> {
    const apiUrl = `${environment.api.adm}/categorias`;
    return this.httpClient.post<any>(apiUrl, categoria);
  }

  edit(categoria: Categoria): Observable<any> {
    const apiUrl = `${environment.api.adm}/categorias`;
    return this.httpClient.put<any>(apiUrl, categoria);
  }

  delete(categoria: Categoria): Observable<any> {
    const apiUrl = `${environment.api.adm}/categorias/${categoria.id}`;
    return this.httpClient.delete<any>(apiUrl);
  }
}
