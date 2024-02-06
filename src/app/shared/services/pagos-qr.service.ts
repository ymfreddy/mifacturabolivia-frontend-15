import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from '../helpers/helper.service';
import { SolicitudGeneracionQr } from '../models/venta.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PagosQrService {

    constructor(private httpClient: HttpClient, private helperService: HelperService) { }

  generar(solicitud: SolicitudGeneracionQr): Observable<any> {
    const apiUrl = `${environment.api.adm}/pagos-qr/generar`;
    console.log(solicitud);
    return this.httpClient.post<any>(apiUrl, solicitud);
  }

}
