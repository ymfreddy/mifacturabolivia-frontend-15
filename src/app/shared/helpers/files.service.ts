import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BrowserDetectorService } from '../services/browser-detector.service';
import * as printJS from "print-js";
import * as FileSaver from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  mimeType = 'application/pdf';
  constructor(private httpClient: HttpClient,
    private browserDetectorService:BrowserDetectorService) { }

    uploadLogo(formData: FormData, nit:number): Observable<any> {
        const apiUrl = `${environment.api.adm}/imagenes/logo/`+nit;
        return this.httpClient.post<any>(apiUrl, formData);
      }

  uploadImage(formData: FormData): Observable<any> {
    const apiUrl = `${environment.api.adm}/imagenes/subir`;
    return this.httpClient.post<any>(apiUrl, formData);
  }

  printFile(blob: Blob, fileName: string , imprimir:boolean):void{
        const file = new Blob([blob], { type: this.mimeType });
        const fileURL = URL.createObjectURL(file);
         if (imprimir){
            if (this.browserDetectorService.getBrowserName().toUpperCase() ==='FIREFOX'){
                let height = window.screen.availHeight - 100;
                let width = window.screen.availWidth - 100;
                let myWindow = window.open(fileURL,'_blank',`top=20,left=20,height=${height},width=${width},resizable=yes`);
                setTimeout(function () {
                    myWindow!.print();
                    myWindow!.focus();
                }, 500);
            }
            else{
                printJS(fileURL);
            }
        }else{
            const link = document.createElement('a');
            link.href = fileURL;
            link.download = fileName;
            link.click();
        }
  }

  blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
          const dataUrl = reader.result as string;
          const base64 = dataUrl.split(',')[1];
          resolve(base64);
      };
      reader.readAsDataURL(blob);
    });
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    let EXCEL_TYPE =
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], {
        type: EXCEL_TYPE,
    });
    FileSaver.saveAs(
        data,
        fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION
    );
  }

}
