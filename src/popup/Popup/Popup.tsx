import { Divider } from 'antd';
import { Header } from '../components/Header/Header';
import { useEffect, useState } from 'react';

import { Home } from '../components/Home/Home';
import { Navigation } from '../components/Navigation/Navigation';
import { TPopupTab } from '../../types/types';
import { Account } from '../components/Account/Account';

export const Popup = () => {
  const [currentTab, setCurrentTab] = useState<TPopupTab>('home');

  const getCuttentTab = (tab: TPopupTab) => {
    switch (tab) {
      case 'home':
        return <Home />;
      case 'upgrade':
        return <div>Upgrade</div>;
      case 'account':
        return <Account />;
    }
  };
  return (
    <>
      <Header />
      <Divider style={{ marginBottom: '8px' }} />
      {getCuttentTab(currentTab)}

      <Navigation setCurrentTab={setCurrentTab} />
    </>
  );
};
