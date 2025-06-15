import { Divider } from 'antd';
import { Header } from '../components/Header/Header';
import { useEffect, useState } from 'react';

import { Home } from '../components/Home/Home';
import { Navigation } from '../components/Navigation/Navigation';
import { TPopupTab } from '../../types/types';
import { Account } from '../components/Account/Account';
import { domain } from '../../assets/config/domain';
import { Upgrade } from '../components/Upgrade/Upgrade';

export const Popup = () => {
  const [isSubscriptionActive, setIsSubscriptionActive] = useState<
    boolean | null
  >(null);
  const [currentTab, setCurrentTab] = useState<TPopupTab>('home');
  const [isAuth, setIsAuth] = useState(false);
  const [isTrial, setIsTrial] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isAuth) return;
    chrome.storage.local.get(['userId'], async ({ userId }) => {
      if (!userId) {
        setIsSubscriptionActive(false);
        return;
      }

      try {
        const res = await fetch(`${domain}/api/check-subscription`, {
          method: 'POST',
          body: JSON.stringify({ userId }),
        });
        const data = await res.json();
        console.log('data', data);
        setIsSubscriptionActive(data.isActive);
        setIsTrial(data.isTrial);
        chrome.storage.local.set({
          trialStartedAt: data.trialStartedAt,
          trialDuration: data.trialDuration,
          email: data.email,
          isSubscriptionActive: data.isActive,
        });
      } catch (err) {
        console.error('Error checking subscription:', err);
        setIsSubscriptionActive(false);
      }
    });
  }, [isAuth]);

  useEffect(() => {
    if (isAuth) return;
    chrome.storage.local.get(['userId'], ({ userId }) => {
      if (userId) {
        // TODO: check user by id
        setIsAuth(true);
      } else {
        setCurrentTab('account');
      }
    });
  }, [isAuth]);

  useEffect(() => {
    console.log('isSubscriptionActive', isSubscriptionActive);
    if (isSubscriptionActive === null) return;
    if (!isSubscriptionActive) {
      setCurrentTab('upgrade');
    }
  }, [isSubscriptionActive]);

  const getCuttentTab = (tab: TPopupTab) => {
    switch (tab) {
      case 'home':
        return isAuth &&
          (isSubscriptionActive || isSubscriptionActive === null) ? (
          <Home />
        ) : null;
      case 'upgrade':
        return isAuth ? (
          <Upgrade isTrial={isTrial} setIsTrial={setIsTrial} />
        ) : null;
      case 'account':
        return <Account isAuth={isAuth} setIsAuth={setIsAuth} />;
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
        isSubscriptionActive={isSubscriptionActive}
      />
    </>
  );
};
