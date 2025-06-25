import { Flex, Spin, Statistic, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { TSubscriptionData } from '../../../types/types';

type TProps = {
  subscriptionData: TSubscriptionData;
  setSubscriptionData: React.Dispatch<React.SetStateAction<TSubscriptionData>>;
};

export const Countdown = ({
  subscriptionData,
  setSubscriptionData,
}: TProps) => {
  const [secondsLeft, setSecondsLeft] = useState(null);

  const { isSubscriptionStarted, subscriptionExpiresAt } = subscriptionData;

  useEffect(() => {
    console.log('in use effect', Date.now());
    if (isSubscriptionStarted) {
      const secondsLeft = Math.max(
        0,
        new Date(subscriptionExpiresAt).getTime() - Date.now()
      );
      setSecondsLeft(secondsLeft / 1000);
    } else {
      chrome.storage.local.get(['subcriptionData'], ({ subcriptionData }) => {
        const secondsPassed = Math.floor(
          (Date.now() - new Date(subcriptionData.trialStartedAt).getTime()) /
            1000
        );
        const secondsLeft = Math.max(
          0,
          subcriptionData.trialDuration / 1000 - secondsPassed
        );
        setSecondsLeft(secondsLeft);
      });
    }
  }, []);

  const onFinishTrial = () => {
    chrome.runtime.sendMessage({ type: 'FINISH_TRIAL' });
    setSubscriptionData({ ...subscriptionData, isActive: false });
    chrome.storage.local.get(['subcriptionData'], result => {
      const currentSettings = result.subcriptionData || {};

      const updatedSettings = {
        ...currentSettings,
        isActive: false,
      };

      chrome.storage.local.set({ subcriptionData: updatedSettings }, () => {});
    });
    setSecondsLeft(0);
  };

  return (
    <div>
      {secondsLeft === null ? (
        <Spin />
      ) : (
        <Flex align="center" vertical>
          <Typography.Text strong>
            {isSubscriptionStarted
              ? 'Subscription time left:'
              : 'Trial time left:'}
          </Typography.Text>
          <Statistic.Countdown
            value={Date.now() + secondsLeft * 1000}
            format="DD:HH:mm:ss"
            onFinish={onFinishTrial}
          />
        </Flex>
      )}
    </div>
  );
};
