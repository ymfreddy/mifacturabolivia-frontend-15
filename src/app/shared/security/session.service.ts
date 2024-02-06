import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MenuOpcion } from '../models/menu-opcion';
import { Router } from '@angular/router';
import { adm } from 'src/app/shared/constants/adm';
import {
    SessionUsuario,
    Asociacion,
} from '../models/session-usuario.model';

@Injectable({
    providedIn: 'root',
})
export class SessionService {
    constructor(private router: Router) {}

    verifyUrl(url:string):boolean{
        const menu:MenuOpcion[] = this.getSessionMenu();
        const existeUrl = menu.find(x=>x.ruta==url);
        return existeUrl!=undefined;
    }

    isSuperAdmin():boolean{
        return this.getSessionUserData().idTipoUsuario===adm.TIPO_USUARIO_SUPERADMIN;
    }

    isAdmin():boolean{
        return this.getSessionUserData().idTipoUsuario===adm.TIPO_USUARIO_ADMIN;
    }

    getSessionEmpresaNit(): number {
        if (sessionStorage.getItem('wx-user-data') == null) {
            this.router.navigateByUrl('');
            return 0;
        }

        const nitEmpresa = JSON.parse(
            sessionStorage.getItem('wx-user-data') ?? ''
        ).empresaNit;
        return parseInt(nitEmpresa ?? '0');
    }

    getSessionEmpresaId(): number {
        if (sessionStorage.getItem('wx-user-data') == null) {
            this.router.navigateByUrl('');
            return 0;
        }

        const idEmpresa = JSON.parse(
            sessionStorage.getItem('wx-user-data') ?? ''
        ).idEmpresa;
        return parseInt(idEmpresa ?? '0');
    }

    getSessionAsociaciones(): Asociacion[] {
        if (sessionStorage.getItem('wx-user-data') == null) {
            this.router.navigateByUrl('');
            return [];
        }

        const asociaciones = JSON.parse(
            sessionStorage.getItem('wx-user-data') ?? ''
        ).asociaciones;
        return asociaciones ?? [];
    }

    setSessionMenu(value: any) {
        sessionStorage.setItem('wx-menu', JSON.stringify(value));
    }

    getSessionMenu(): MenuOpcion[] {
        return JSON.parse(sessionStorage.getItem('wx-menu') ?? '[]');
    }

    setSessionUserData(value: SessionUsuario) {
        sessionStorage.setItem('wx-user-data', JSON.stringify(value));
    }

    getSessionUserData(): SessionUsuario {
        if (sessionStorage.getItem('wx-user-data') == null) {
            this.router.navigateByUrl('');
        }

        return JSON.parse(sessionStorage.getItem('wx-user-data') ?? '{}');
    }

    // FACTURA
    setRegistroFacturaRecepcion(data: any): void {
        sessionStorage.setItem('wx-fcv-data', JSON.stringify(data));
    }

    getRegistroFacturaRecepcion(): any {
        return JSON.parse(sessionStorage.getItem('wx-fcv-data') ?? '{}');
    }

    setBusquedaFactura(data: any): void {
        sessionStorage.setItem('wx-fcv-list', JSON.stringify(data));
    }

    getBusquedaFactura(): any {
        const valor = sessionStorage.getItem('wx-fcv-list');
        if (!valor) return null;
        return JSON.parse(sessionStorage.getItem('wx-fcv-list') ?? '{}');
    }

    // VENTA
    setRegistroVenta(data: any): void {
        sessionStorage.setItem('wx-venta-data', JSON.stringify(data));
    }

    getRegistroVenta(): any {
        return JSON.parse(sessionStorage.getItem('wx-venta-data') ?? '{}');
    }

    setBusquedaVenta(data: any): void {
        sessionStorage.setItem('wx-venta-list', JSON.stringify(data));
    }

    getBusquedaVenta(): any {
        const valor = sessionStorage.getItem('wx-venta-list');
        if (!valor) return null;
        return JSON.parse(sessionStorage.getItem('wx-venta-list') ?? '{}');
    }

    setBusquedaVentaCredito(data: any): void {
        sessionStorage.setItem('wx-venta-cred-list', JSON.stringify(data));
    }

    getBusquedaVentaCredito(): any {
        const valor = sessionStorage.getItem('wx-venta-cred-list');
        if (!valor) return null;
        return JSON.parse(sessionStorage.getItem('wx-venta-cred-list') ?? '{}');
    }

    // DESCUENTO
    setRegistroDescuento(data: any): void {
        sessionStorage.setItem('wx-descuento-data', JSON.stringify(data));
    }

    getRegistroDescuento(): any {
        return JSON.parse(sessionStorage.getItem('wx-descuento-data') ?? '{}');
    }

    setBusquedaDescuento(data: any): void {
        sessionStorage.setItem('wx-descuento-list', JSON.stringify(data));
    }

    getBusquedaDescuento(): any {
        const valor = sessionStorage.getItem('wx-descuento-list');
        if (!valor) return null;
        return JSON.parse(sessionStorage.getItem('wx-descuento-list') ?? '{}');
    }

    // COMPRA
    setRegistroCompra(data: any): void {
        sessionStorage.setItem('wx-compra-data', JSON.stringify(data));
    }

    getRegistroCompra(): any {
        return JSON.parse(sessionStorage.getItem('wx-compra-data') ?? '{}');
    }

    setBusquedaCompra(data: any): void {
        sessionStorage.setItem('wx-compra-list', JSON.stringify(data));
    }

    getBusquedaCompra(): any {
        const valor = sessionStorage.getItem('wx-compra-list');
        if (!valor) return null;
        return JSON.parse(sessionStorage.getItem('wx-compra-list') ?? '{}');
    }
    // TURNO
    setTurno(idTurno: number): void {
        const datos = JSON.parse(sessionStorage.getItem('wx-user-data') ?? '');
        datos.idTurno = idTurno;
        sessionStorage.setItem('wx-user-data', JSON.stringify(datos));
    }

    getTurno(): number {
        if (sessionStorage.getItem('wx-user-data') == null) {
            this.router.navigateByUrl('');
            return 0;
        }
        const idTurno = JSON.parse(
            sessionStorage.getItem('wx-user-data') ?? ''
        ).idTurno;
        return parseInt(idTurno ?? '0');
    }

    //
    setGps(activo: boolean): void {
        const datos = JSON.parse(sessionStorage.getItem('wx-user-data') ?? '');
        datos.gps = activo;
        sessionStorage.setItem('wx-user-data', JSON.stringify(datos));
    }

    getGps(): boolean {
        if (sessionStorage.getItem('wx-user-data') == null) {
            return false;
        }
        const data = JSON.parse(sessionStorage.getItem('wx-user-data') ?? '');
        if (data) {
            return data.gps ?? false;
        }
        return false;
    }

    // venta
    setBusquedaVisita(data: any): void {
        sessionStorage.setItem('wx-visita-list', JSON.stringify(data));
    }

    getBusquedaVisita(): any {
        const valor = sessionStorage.getItem('wx-visita-list');
        if (!valor) return null;
        return JSON.parse(sessionStorage.getItem('wx-visita-list') ?? '{}');
    }

    // INTERESADO
    setRegistroInteresado(data: any): void {
            sessionStorage.setItem('wx-interesado-data', JSON.stringify(data));
    }

    getRegistroInteresado(): any {
            return JSON.parse(sessionStorage.getItem('wx-interesado-data') ?? '{}');
    }

    getFacturaIceAsignada():boolean{
        return this.getSessionUserData().facturaIce??false;
    }

}
