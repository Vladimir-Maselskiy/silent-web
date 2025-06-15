import { BillingPlan } from '../BillingPlan/BillingPlan';
import { TBillingPlan } from '../../../types/types';
import { Flex } from 'antd';

const plans = [
  {
    id: '1',
    cost: 3.84,
    defaultCost: 7.5,
    currency: 'USD',
    duration: 12,
    currencySymbol: '$',
    description: 'billed every year',
  },
  {
    id: '2',
    cost: 7.5,
    defaultCost: 7.5,
    currency: 'USD',
    duration: 1,
    currencySymbol: '$',
    description: 'billed every month',
  },
] as TBillingPlan[];

export const SubscribeSection = () => {
  return (
    <Flex
      align="center"
      vertical
      gap={16}
      style={{ width: '100%', marginTop: 56 }}
    >
      {plans.map(plan => (
        <BillingPlan key={plan.id} plan={plan} />
      ))}
    </Flex>
  );
};
