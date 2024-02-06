import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Mesa, MesaGrupoGestion } from 'src/app/shared/models/mesa';
import { SessionService } from 'src/app/shared/security/session.service';
import { MesasService } from 'src/app/shared/services/mesas.service';
import { FormularioMesaComponent } from '../formulario-mesa/formulario-mesa.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lista-mesas',
  templateUrl: './lista-mesas.component.html',
  styleUrls: ['./lista-mesas.component.scss']
})
export class ListaMesasComponent implements OnInit {
    grupos!: MesaGrupoGestion[];

  constructor(private sessionService: SessionService,
    private informationService: InformationService,
    private confirmationService: ConfirmationService,
    private mesasService: MesasService,
    public dialogService: DialogService,
    private router: Router) { }

  ngOnInit(): void {
    if (!this.sessionService.verifyUrl(this.router.url)) {
        this.router.navigate(['/auth/access']);
    }
    this.loadData();
  }

  loadData(){
    this.mesasService.getByIdSucursal(this.sessionService.getSessionUserData().idSucursal).subscribe((response: any) => {
        if (response.success) {
            console.log(response.content);
          const mesas: Mesa[] = response.content;
          this.grupos = this.getGroupedList(mesas);
          console.log(this.grupos );
        } else {
          this.informationService.showError(response.message);
        }
      });
  }



    eliminar(item: Mesa){
        this.confirmationService.confirm({
            message: 'Esta seguro de eliminar la mesa '+item.numero+', '+item.lugar +' ?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.mesasService.delete(item).subscribe({
                    next: (res) => {
                        this.informationService.showSuccess(res.message);
                        this.loadData();
                    },
                    error: (err) => {
                        this.informationService.showError(err.error.message);
                    },
                });
            },
        });
    }

    nuevo(){
        const ref = this.dialogService.open(FormularioMesaComponent, {
            header: 'Nuevo',
            width: '350px',
            data: { idSucursal: this.sessionService.getSessionUserData().idSucursal},
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.loadData();
            }
        });
    }

    editar(item: Mesa){
        const ref = this.dialogService.open(FormularioMesaComponent, {
            header: 'Actualizar',
            width: '350px',
            data: { idSucursal: this.sessionService.getSessionUserData().idSucursal, item: item },
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.loadData();
            }
        });
        }

  getGroupedList(mesas: Mesa[]):any[]{
    let itemsOpciones:MesaGrupoGestion[]=[];
    const grouped = this.groupByx(mesas, (i:Mesa) => i.lugar);
    grouped.forEach((value: [], key: string) => {
      const xx : MesaGrupoGestion ={
          lugar:key,
          mesas:value.map((it:Mesa)=>{return {id: it.id, numero:it.numero, lugar:it.lugar, idSucursal: it.idSucursal, idEmpresa: it.idEmpresa }})
      }
      itemsOpciones.push(xx)
    });
    return itemsOpciones;
}

private groupByx(list:Mesa[], keyGetter:any) {
    const map = new Map();
    list.forEach((item) => {
       const key = keyGetter(item);
       const collection = map.get(key);
       if (!collection) {
           map.set(key, [item]);
       } else {
           collection.push(item);
       }
    });
    return map;
    }

}
