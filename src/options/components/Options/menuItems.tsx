import type { MenuProps } from 'antd';
export type MenuItem = Required<MenuProps>['items'][number];
export const webResourceItems = [
  {
    key: '1',
    label: 'All domains',
  },
  {
    key: '2',
    label: 'Reddit',
  },
  {
    key: '8',
    label: 'DR.DK',
  },
  {
    key: '3',
    label: 'The New York Times',
    disabled: true,
  },
  {
    key: '4',
    label: 'THE WALL STREET JOURNAL',
    disabled: true,
  },
  {
    key: '5',
    label: 'Twitter',
    disabled: true,
  },
  {
    key: '6',
    label: 'Facebook',
    disabled: true,
  },
  {
    key: '7',
    label: 'Exclude domains',
  },
];
