import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HelperService } from '../helpers/helper.service';
import { Visita, VisitaDetalle, VisitaRegistro } from '../models/visita.model';

@Injectable({
    providedIn: 'root',
})
export class VisitasService {
    constructor(
        private httpClient: HttpClient,
        private helperService: HelperService
    ) {}

    get(criteriosSearch: any): Observable<any> {
        const queryString =
            this.helperService.jsonToQueryString(criteriosSearch);
        const apiUrl = `${environment.api.adm}/visitas/listar?${queryString}`;
        return this.httpClient.get<any>(apiUrl);
    }

    add(visita: VisitaRegistro): Observable<any> {
        const apiUrl = `${environment.api.adm}/visitas`;
        return this.httpClient.post<any>(apiUrl, visita);
    }

    init(visita: Visita): Observable<any> {
        const apiUrl = `${environment.api.adm}/visitas/inicios/${visita.id}`;
        return this.httpClient.post<any>(apiUrl, visita);
    }

    finalize(visita: Visita): Observable<any> {
        const apiUrl = `${environment.api.adm}/visitas/finalizaciones/${visita.id}`;
        return this.httpClient.post<any>(apiUrl, visita);
    }

    edit(visita: Visita): Observable<any> {
        const apiUrl = `${environment.api.adm}/visitas`;
        return this.httpClient.put<any>(apiUrl, visita);
    }

    delete(visita: Visita): Observable<any> {
        const apiUrl = `${environment.api.adm}/visitas/${visita.id}`;
        return this.httpClient.delete<any>(apiUrl);
    }

    cancel(visita: Visita, idMotivo: number): Observable<any> {
        const apiUrl = `${environment.api.adm}/visitas/cancelaciones/${visita.id}/${idMotivo}`;
        return this.httpClient.post<any>(apiUrl, visita);
    }

    getDataFacturacion(id: number): Observable<any> {
        const apiUrl = `${environment.api.adm}/visitas/datos-facturacion/${id}`;
        return this.httpClient.get<any>(apiUrl);
    }

    // detalle
    getDetail(id: number): Observable<any> {
        const apiUrl = `${environment.api.adm}/visitas/detalles/${id}`;
        return this.httpClient.get<any>(apiUrl);
    }
    addDetail(detalle: VisitaDetalle): Observable<any> {
        const apiUrl = `${environment.api.adm}/visitas/detalles`;
        return this.httpClient.post<any>(apiUrl, detalle);
    }
}
