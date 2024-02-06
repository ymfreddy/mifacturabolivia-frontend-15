import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { interval } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UpdateAppService {

    constructor(public updates: SwUpdate) {
        if (updates.isEnabled) {
        //const everySixHours$ = interval(6 * 60 * 60 * 1000);
          interval(6 * 60 * 60).subscribe(() => updates.checkForUpdate()
            .then(() => console.log('Verificando actualizaciones')));
        }
      }

      public checkForUpdates(): void {
        this.updates.available.subscribe(event => this.promptUser());
      }

      private promptUser(): void {
        console.log('actualizando a la nueva version');
        this.updates.activateUpdate().then(() => {
            if (confirm('Existe una nueva versión de la aplicación, por favor actualice')){
                document.location.reload()
            }
        });
      }
}
