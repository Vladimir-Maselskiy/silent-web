import type { MenuProps } from 'antd';
export type MenuItem = Required<MenuProps>['items'][number];
export const webResourceItems = [
  {
    key: '1',
    label: 'Reddit',
  },
  {
    key: '2',
    label: 'The New York Times',
    disabled: true,
  },
  {
    key: '3',
    label: 'THE WALL STREET JOURNAL',
    disabled: true,
  },
  {
    key: '4',
    label: 'Twitter',
    disabled: true,
  },
  {
    key: '5',
    label: 'Facebook',
    disabled: true,
  },
  {
    key: '6',
    label: 'All domains',
  },
  {
    key: '7',
    label: 'Exclude domains',
  },
];
