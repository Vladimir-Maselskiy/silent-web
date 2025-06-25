import { PlaySquareOutlined } from '@ant-design/icons';
import { Button, Flex } from 'antd';
import { useState } from 'react';
import { domain } from '../../../assets/config/domain';
import { Countdown } from '../Countdown/Countdown';
import { SubscribeSection } from '../SubscribeSection/SubscribeSection';
import { TSubscriptionData } from '../../../types/types';

type TProps = {
  subscriptionData: TSubscriptionData;
  setSubscriptionData: React.Dispatch<React.SetStateAction<TSubscriptionData>>;
};

export const Upgrade = ({ subscriptionData, setSubscriptionData }: TProps) => {
  const { isSubscriptionStarted, isActive, trialStartedAt } = subscriptionData;
  const [isLoading, setIsLoading] = useState(false);

  const onStartTrialButtonClick = async () => {
    setIsLoading(true);
    chrome.storage.local.get(['userId'], async ({ userId }) => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${domain}/api/create-trial`, {
          method: 'POST',
          body: JSON.stringify({ userId }),
        });
        const data = await res.json();

        chrome.storage.local.get(['subscriptionData'], result => {
          const currentSettings = result.subscriptionData || {};

          const updatedSettings = {
            ...currentSettings,
            trialStartedAt: data.trialStartedAt,
            trialDuration: data.trialDuration,
            isActive: data.isActive,
          };

          chrome.storage.local.set(
            { subscriptionData: updatedSettings },
            () => {
              setSubscriptionData(prev => ({
                ...prev,
                trialStartedAt: data.trialStartedAt,
                trialDuration: data.trialDuration,
              }));
            }
          );
        });
      } catch (err) {
        console.error('Error create trial:', err);
      } finally {
        setIsLoading(false);
      }
    });
  };

  return (
    <Flex
      align="center"
      justify="center"
      vertical
      style={{ marginTop: '24px' }}
    >
      {!isSubscriptionStarted && !trialStartedAt && (
        <Button
          onClick={onStartTrialButtonClick}
          type="primary"
          icon={<PlaySquareOutlined />}
          loading={isLoading}
        >
          Start trial
        </Button>
      )}
      {(trialStartedAt || isSubscriptionStarted) && (
        <Countdown
          subscriptionData={subscriptionData}
          setSubscriptionData={setSubscriptionData}
        />
      )}
      {((isSubscriptionStarted && !isActive) || !isSubscriptionStarted) && (
        <SubscribeSection />
      )}
    </Flex>
  );
};
