import { Flex, Image, Typography } from 'antd';
import React from 'react';

export const Logo = () => {
  return (
    <Flex align="center" gap={8}>
      <Image width={36} style={{ borderRadius: '8px' }} src="/logo.png" />
      <Typography.Text style={{ fontSize: '24px' }}>SilentWeb</Typography.Text>
    </Flex>
  );
};
