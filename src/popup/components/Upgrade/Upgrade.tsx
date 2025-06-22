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
  const [isLoading, setIsLoading] = useState(false);

  const { isTrial, isSubscriptionStarted, isActive } = subscriptionData;

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

        await chrome.storage.local.set({
          isSubscriptionActive: data.isActive,
          trialStartedAt: data.trialStartedAt,
          trialDuration: data.trialDuration,
          isActive: data.isActive,
        });
      } catch (err) {
        console.error('Error create trial:', err);
      }
    });
  };

  console.log('subscriptionData', subscriptionData);
  console.log('isTrial', isTrial);

  return (
    <Flex
      align="center"
      justify="center"
      vertical
      style={{ marginTop: '24px' }}
    >
      {isTrial && !isSubscriptionStarted && (
        <Button
          onClick={onStartTrialButtonClick}
          type="primary"
          icon={<PlaySquareOutlined />}
          loading={isLoading}
        >
          Start trial
        </Button>
      )}
      <Countdown subscriptionData={subscriptionData} />
      {isSubscriptionStarted && !isActive && <SubscribeSection />}
    </Flex>
  );
};
