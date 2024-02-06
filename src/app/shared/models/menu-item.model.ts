export interface MenuItem {
  id?: number;
  displayName: string;
  disabled?: boolean;
  icon: string;
  elementName?: string;
  route: string;
  children?: MenuItem[];
}
