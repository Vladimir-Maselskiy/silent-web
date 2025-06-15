import { PlaySquareOutlined } from '@ant-design/icons';
import { Button, Flex, Statistic } from 'antd';
import { useEffect, useState } from 'react';
import { domain } from '../../../assets/config/domain';
import { Countdown } from '../Countdown/Countdown';
// const { Timer } = Statistic;

type TProps = {
  isTrial: boolean | null;
  setIsTrial: React.Dispatch<React.SetStateAction<boolean | null>>;
};

export const Upgrade = ({ isTrial, setIsTrial }: TProps) => {
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

        chrome.storage.local.set({ isSubscriptionActive: data.isActive });

        setIsTrial(data.isTrial);
      } catch (err) {
        console.error('Error create trial:', err);
      }
    });
  };

  return (
    <Flex align="center" justify="center" style={{ marginTop: '24px' }}>
      {isTrial ? (
        <Countdown />
      ) : (
        <Button
          onClick={onStartTrialButtonClick}
          type="primary"
          icon={<PlaySquareOutlined />}
          loading={isLoading}
        >
          Start trial
        </Button>
      )}
    </Flex>
  );
};
