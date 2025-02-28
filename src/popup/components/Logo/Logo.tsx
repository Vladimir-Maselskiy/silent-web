import { Flex, Image, Typography } from 'antd';
import React from 'react';

type TProps = { style?: React.CSSProperties };

export const Logo = ({ style }: TProps) => {
  return (
    <Flex align="center" gap={8} style={{ ...style }}>
      <Image width={36} style={{ borderRadius: '8px' }} src="/logo.png" />
      <Typography.Text style={{ fontSize: '24px' }}>SilentWeb</Typography.Text>
    </Flex>
  );
};
