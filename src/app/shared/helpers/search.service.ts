import { FacturaSearch } from './../models/factura-search.model';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor() { }

  getFacturaSearchInit(): FacturaSearch {
    const fechaActual = new Date();
    const gestion = fechaActual.getFullYear();
    const mes = fechaActual.getMonth();
    const facturaSearch = {
      fechaDesde: new Date(gestion, mes, 1, 0, 0, 0),
      fechaHasta: new Date(gestion, mes + 1, 0, 11, 59, 59)
    }
    return facturaSearch;
  }
}
