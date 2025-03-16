import type { MenuProps } from 'antd';
export type MenuItem = Required<MenuProps>['items'][number];
export const webResourceItems = [
  {
    key: '1',
    label: 'Words // Phrases',
  },
  {
    key: '2',
    label: 'Exclude domains',
  },
];
