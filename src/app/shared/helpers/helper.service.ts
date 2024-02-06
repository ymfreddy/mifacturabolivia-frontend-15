import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MenuOpcion } from '../models/menu-opcion';

@Injectable({
    providedIn: 'root',
})
export class HelperService {
    constructor(public datepipe: DatePipe) {}

    jsonToString(jsonObject: any):string{
        if (jsonObject==null) return '';
        const queryString = Object.keys(jsonObject)
            .map((key) => {
                return jsonObject[key] != null && jsonObject[key] != 0
                    ? `${key}: ${jsonObject[key]}`
                    : '';
            })
            .filter(Boolean)
            .join('\n');

        return queryString;
    }

    jsonToQueryString(jsonObject: any): string {
        const queryString = Object.keys(jsonObject)
            .map((key) => {
                if (key == 'fechaInicio' || key == 'fechaFin' || key == 'fecha' || key == 'fechaAsignacion') {
                    if (
                        jsonObject[key] != null &&
                        typeof jsonObject[key] == 'object'
                    ) {
                        jsonObject[key] = this.datepipe.transform(
                            jsonObject[key],
                            'dd/MM/yyyy'
                        );
                    }
                }
                return jsonObject[key] != null
                    ? `${key}=${jsonObject[key]}`
                    : '';
            })
            .filter(Boolean)
            .join('&');

        return queryString;
    }

    jsonToQueryStringSinfiltro(jsonObject: any): string {
        const queryString = Object.keys(jsonObject)
            .map((key) => {
                return jsonObject[key] != null
                    ? `${key}=${jsonObject[key]}`
                    : '';
            })
            .filter(Boolean)
            .join('&');

        return queryString;
    }

    /* Dates Helper */
    getDays(): string[] {
        return new Array(31)
            .fill('')
            .map((v, i) => (i + 1).toString().padStart(2, '0'));
    }

    getMonths(): string[] {
        return [
            'Enero',
            'Febrero',
            'Marzo',
            'Abril',
            'Mayo',
            'Junio',
            'Julio',
            'Agosto',
            'Septiembre',
            'Octubre',
            'Noviembre',
            'Diciembre',
        ];
    }

    getYears(): string[] {
        return new Array(40).fill('').map((v, i) => {
            const now = new Date();
            return (now.getFullYear() - (i + 10)).toString();
        });
    }

    getDate(fechaCadena?: string): Date {
        let fecha = new Date();
        if (fechaCadena) {
            var dateParts = fechaCadena.toString().split('/');
            fecha = new Date(+dateParts[2], +dateParts[1] - 1, +dateParts[0]);
        }
        return fecha;
    }

    getDateTime(fechaCadena?: string): Date {
        let fecha = new Date();
        if (fechaCadena) {
            const [dateComponents, timeComponents] = fechaCadena!.split(' ');
            const [hours, minutes] = timeComponents.split(':');
            var dateParts = dateComponents.toString().split('/');

            fecha = new Date(+dateParts[2], +dateParts[1] - 1, +dateParts[0],+hours, +minutes);
        }
        return fecha;
    }

    getDateTimeFromPeriodo(fechaCadena?: string): Date {
        let fecha = new Date();
        if (fechaCadena) {
            var dateParts = fechaCadena.toString().split('/');
            console.log(dateParts);
            fecha = new Date(+dateParts[1], +dateParts[0] - 1);
        }
        return fecha;
    }

    getGroupedList(menus: MenuOpcion[]):any[]{
        let itemsOpciones:any[]=[];
        const grouped = this.groupByx(menus, (i:MenuOpcion) => i.grupo);
        grouped.forEach((value: [], key: string) => {
            const xx = {
                label:key.substring(2),
                items:value.map((it:any)=>{return {label: it.titulo, icon:it.icono, routerLink: [it.ruta], id:it.id, descripcion: it.descripcion }})
            }
            itemsOpciones.push(xx)
        });
        return itemsOpciones;
    }

    private groupByx(list:MenuOpcion[], keyGetter:any) {
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

    round(num:any, decimals: number):number {
        var sign = num >= 0 ? 1 : -1;
        return Number((Math.round((num*Math.pow(10,decimals)) + (sign*0.001)) / Math.pow(10,decimals)).toFixed(decimals));
    }
}
