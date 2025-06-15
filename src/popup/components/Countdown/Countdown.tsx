import { Flex, Spin, Statistic, Typography } from 'antd';
import { useEffect, useState } from 'react';

type TProps = {};

export const Countdown = () => {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    chrome.storage.local.get(
      ['trialStartedAt', 'trialDuration'],
      ({ trialStartedAt, trialDuration }) => {
        console.log('trialStartedAt', trialStartedAt);
        console.log('trialDuration', trialDuration);
        const secondsPassed = Math.floor(
          (Date.now() - new Date(trialStartedAt).getTime()) / 1000
        );
        const secondsLeft = Math.max(0, trialDuration / 1000 - secondsPassed);
        setSecondsLeft(secondsLeft);
      }
    );
  }, []);

  return (
    <div>
      {secondsLeft ? (
        <Flex align="center" vertical>
          <Typography.Text strong>Trial time left:</Typography.Text>
          <Statistic.Countdown
            value={Date.now() + secondsLeft * 1000}
            format="DD:HH:mm:ss"
          />
        </Flex>
      ) : (
        <Spin />
      )}
    </div>
  );
};
