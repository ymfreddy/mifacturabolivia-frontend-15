import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class InformationService {

  constructor(private messageService: MessageService) { }

  showError(message?: string, duration?: number): void {
    const durationError: number = duration?? 45000;
    this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: message,
      });
  }

  showSuccess(message: string): void {
    this.messageService.add({
        severity: 'success',
        summary: 'Correcto',
        detail: message,
      });
  }

  /*showSuccessFactura(message: any): void {
    this.messageService.add({
        severity: 'success',
        summary: 'Correcto',
        detail: 'Código Recepción: '+message.codigoRecepcion+'\n'+
        'Código Descripción: '+message.codigoDescripcion+'\n'+
        'Código Estado: '+message.codigoEstado+'\n'+
        'Código Factura: '+message.idFactura
      });
  }*/

  showWarning(message: string): void {
    this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: message,
      });
  }

  showInfo(message: string): void {
    this.messageService.add({
        severity: 'info',
        summary: 'Información',
        detail: message,
      });
  }
}
