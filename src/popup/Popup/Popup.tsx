import { Divider } from 'antd';
import { Header } from '../components/Header/Header';
import { useEffect, useState } from 'react';

import { Home } from '../components/Home/Home';
import { Navigation } from '../components/Navigation/Navigation';
import { TPopupTab, TSubscriptionData } from '../../types/types';
import { Account } from '../components/Account/Account';
import { domain } from '../../assets/config/domain';
import { Upgrade } from '../components/Upgrade/Upgrade';

export const Popup = () => {
  const [isActive, setIsActive] = useState<boolean>(null);
  const [currentTab, setCurrentTab] = useState<TPopupTab>('home');
  const [isAuth, setIsAuth] = useState(false);
  const [subcriptionData, setSubcriptionData] =
    useState<TSubscriptionData>(null);
  const [isAuthFormVisible, setIsAuthFormVisible] = useState(false);

  useEffect(() => {
    if (!isAuth) return;
    chrome.storage.local.get(['userId'], async ({ userId }) => {
      if (!userId) {
        setIsActive(false);
        return;
      }
      try {
        const res = await fetch(`${domain}/api/check-subscription`, {
          method: 'POST',
          body: JSON.stringify({ userId }),
        });
        if (!res.ok) {
          chrome.storage.local.remove(['userId']);
          setIsAuth(false);
          return;
        }
        const data = (await res.json()) as TSubscriptionData;
        console.log('data', data);

        setSubcriptionData(data);
        chrome.storage.local.set({
          subcriptionData: data,
          email: data.email,
        });
      } catch (err) {
        console.error('Error checking subscription:', err);
        setIsActive(false);
      }
    });
  }, [isAuth]);

  useEffect(() => {
    if (isAuth) return;
    chrome.storage.local.get(['userId'], ({ userId }) => {
      if (userId) {
        setIsAuth(true);
      } else {
        setCurrentTab('account');
      }
    });
  }, [isAuth]);

  useEffect(() => {
    if (isActive === null) return;
    if (!isActive) {
      setCurrentTab('upgrade');
    }
  }, [isActive]);

  const getCuttentTab = (tab: TPopupTab) => {
    switch (tab) {
      case 'home':
        return isAuth ? <Home setCurrentTab={setCurrentTab} /> : null;
      case 'upgrade':
        return isAuth ? (
          <Upgrade
            subscriptionData={subcriptionData}
            setSubscriptionData={setSubcriptionData}
          />
        ) : null;
      case 'account':
        return (
          <Account
            isAuth={isAuth}
            setIsAuth={setIsAuth}
            isAuthFormVisible={isAuthFormVisible}
            setIsAuthFormVisible={setIsAuthFormVisible}
          />
        );
    }
  };
  return (
    <>
      <Header />
      <Divider style={{ marginBottom: '8px' }} />

      {getCuttentTab(currentTab)}

      <Navigation
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isAuth={isAuth}
        setIsAuth={setIsAuth}
        isActive={isActive}
        setIsAuthFormVisible={setIsAuthFormVisible}
      />
    </>
  );
};
