import { MenuItem } from 'src/app/shared/models/menu-item.model';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  public appDrawer: any;
  public currentUrl = new BehaviorSubject<string>('');
  public activeRoute$ = new Subject<MenuItem>();

  private item!: MenuItem;
  private items: MenuItem[] = [
    { id: 1, displayName: 'Inicio', icon: 'home', route: '/admin/dashboard'},
    { id: 2, displayName: 'Sucursales', icon: 'apartment', route: '/admin/sucursales'},
    { id: 3, displayName: 'Clientes', icon: 'family_restroom', route: '/admin/clientes'},
    { id: 4, displayName: 'Proveedores', icon: 'villa', route: '/admin/proveedores'},
    { id: 5, displayName: 'Usuarios', icon: 'person', route: '/admin/usuarios'},
    { id: 6, displayName: 'Categorías', icon: 'category', route: '/admin/categorias'},
    { id: 7, displayName: 'Productos', icon: 'inventory', route: '/admin/productos'},
    { id: 8, displayName: 'Empresas', icon: 'business_center', route: '/admin/empresas'},
    { id: 9, displayName: 'Asociaciones', icon: 'apartment', route: '/admin/asociaciones'},
    { id: 10, displayName: 'Facturación', icon: 'receipt', route: '/admin/facturas'},
  ];;

  constructor() { }

  public closeNav(): void {
    this.appDrawer.close();
  }

  public openNav(): void {
    this.appDrawer.open();
  }

  public getMenuItems(): MenuItem[] {
    return this.items;
  }

  public setActiveRoute(navItem: MenuItem): void {
    this.activeRoute$.next(navItem);
  }

  public getActiveRoute(): Observable<MenuItem> {
    return this.activeRoute$.asObservable();
  }
}
