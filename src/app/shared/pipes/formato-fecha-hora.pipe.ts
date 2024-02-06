import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'formatoFechaHora',
})
export class FormatoFechaHoraPipe implements PipeTransform {
    constructor(private datePipe: DatePipe) {}
    transform(value: string, conHora: Boolean | Boolean = true): unknown {
        if (conHora)
            return this.datePipe.transform(value, 'dd/MM/yyyy HH:mm');
        else
            return this.datePipe.transform(value, 'dd/MM/yyyy');
    }
}
