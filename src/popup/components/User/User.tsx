import { Button, Flex, Typography } from 'antd';
import React from 'react';

type TProps = {
  email: string;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
};

export const User = ({ email, setIsAuth }: TProps) => {
  const onSignOutClick = () => {
    chrome.storage.local.get(
      ['targets', 'excludedDomains'],
      ({ targets, excludedDomains }) => {
        chrome.storage.local.clear();
        chrome.storage.local.set({ targets, excludedDomains }, () => {
          console.log('storage cleared');
          setIsAuth(false);
        });
      }
    );
  };

  return (
    <Flex
      align="center"
      justify="center"
      vertical
      gap={8}
      style={{ height: 410 }}
    >
      <Typography.Title level={3}>Hello, you are login as</Typography.Title>
      <Typography.Text strong>{email}</Typography.Text>
      <Button onClick={onSignOutClick}>Sign out</Button>
    </Flex>
  );
};
