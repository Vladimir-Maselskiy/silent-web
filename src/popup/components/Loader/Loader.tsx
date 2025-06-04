import { Flex, Spin } from 'antd';
import React from 'react';

export const Loader = () => {
  return (
    <Flex justify="center" align="center" style={{ height: 410 }}>
      <Spin />
    </Flex>
  );
};
