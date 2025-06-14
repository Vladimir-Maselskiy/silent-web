import { Divider } from 'antd';
import { Header } from '../components/Header/Header';
import { useEffect, useState } from 'react';

import { Home } from '../components/Home/Home';
import { Navigation } from '../components/Navigation/Navigation';
import { TPopupTab } from '../../types/types';
import { Account } from '../components/Account/Account';

export const Popup = () => {
  const [currentTab, setCurrentTab] = useState<TPopupTab>('home');
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    if (isAuth) return;
    chrome.storage.local.get(['userId'], ({ userId }) => {
      if (userId) {
        setIsAuth(true);
        console.log('userId', userId);
        // checkTrialStatus(userToken);
      } else {
        setCurrentTab('account');
        // setShowRegistration(true);
        // setLoading(false);
      }
    });
  }, [isAuth]);

  const getCuttentTab = (tab: TPopupTab) => {
    switch (tab) {
      case 'home':
        return <Home />;
      case 'upgrade':
        return <div>Upgrade</div>;
      case 'account':
        return <Account isAuth={isAuth} setIsAuth={setIsAuth} />;
    }
  };
  return (
    <>
      <Header />
      <Divider style={{ marginBottom: '8px' }} />
      {isAuth ? (
        getCuttentTab(currentTab)
      ) : (
        <Account isAuth={isAuth} setIsAuth={setIsAuth} />
      )}

      <Navigation
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isAuth={isAuth}
        setIsAuth={setIsAuth}
      />
    </>
  );
};
