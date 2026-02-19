import { BillingPlan } from '../BillingPlan/BillingPlan';
import { TBillingPlan } from '../../../types/types';
import { Flex } from 'antd';
import { useEffect, useState } from 'react';

const plans = [
  {
    id: '1',
    cost: 0.75,
    defaultCost: 1,
    currency: 'EUR',
    duration: 12,
    currencySymbol: '€',
    description: 'billed every year',
  },
  {
    id: '2',
    cost: 1,
    defaultCost: 1,
    currency: 'EUR',
    duration: 1,
    currencySymbol: '€',
    description: 'billed every month',
  },
] as TBillingPlan[];

export const SubscribeSection = () => {
  const [userId, setUserId] = useState<string>('');
  useEffect(() => {
    chrome.storage.local.get(['userId'], async ({ userId }) => {
      if (userId) {
        setUserId(userId);
        return;
      }
    });
  }, []);
  return (
    <Flex
      align="center"
      vertical
      gap={16}
      style={{ width: '100%', marginTop: 56 }}
    >
      {plans.map(plan => (
        <BillingPlan key={plan.id} plan={plan} userId={userId} />
      ))}
    </Flex>
  );
};
