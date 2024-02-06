import { DecimalPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'formatoDecimal',
})
export class FormatoDecimalPipe implements PipeTransform {
    constructor(private decimalPipe: DecimalPipe) {}
    transform(value: unknown, ...args: unknown[]): unknown {
        return this.decimalPipe.transform(Number(value), '1.2-2');
    }
}
