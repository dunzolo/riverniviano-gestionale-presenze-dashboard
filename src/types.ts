import { MenuDataItem } from "@ant-design/pro-components";

export type Values = Record<string, any>;

export interface Item extends Values {
  id: string;
  created_at?: string;
  updated_at?: string;
}

export interface MenuItem extends MenuDataItem {
  role_names?: string | string[];
  children?: MenuItem[];
}
