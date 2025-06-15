export type TPopupTab = 'home' | 'upgrade' | 'account';

export type TAuthType = 'signUp' | 'signIn';

export type TBillingPlan = {
  id: string;
  cost: number;
  defaultCost: number;
  currency: string;
  currencySymbol: string;
  duration: number;
  description: string;
};
