import { domain } from '../../assets/config/domain';

const CHECK_INTERVAL_MINUTES = 60;

type TArgs = {
  stopBlocking: () => Promise<void>;
};

export function checkSubscription({ stopBlocking }: TArgs) {
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo?.status !== 'complete') return;
    console.log('Checking subscription status...', changeInfo);
    const lastCheckedTime = (await chrome.storage.local.get('lastCheckedTime'))
      ?.lastCheckedTime;
    if (!lastCheckedTime) {
      await chrome.storage.local.set({ lastCheckedTime: Date.now() });
      makeSubscriptionCheck();
    }
    const currentTime = Date.now();
    const timeSinceLastCheck = (currentTime - Number(lastCheckedTime)) / 1000;
    if (timeSinceLastCheck < CHECK_INTERVAL_MINUTES * 60) return;
    await chrome.storage.local.set({ lastCheckedTime: Date.now() });
    makeSubscriptionCheck();
  });

  async function makeSubscriptionCheck() {
    console.log('Checking subscription status...');
    chrome.storage.local.get(['userId'], async ({ userId }) => {
      if (!userId) {
        setIsActiveStatusInStorage(false);
        stopBlocking();
        return;
      }
      try {
        const res = await fetch(`${domain}/api/check-subscription`, {
          method: 'POST',
          body: JSON.stringify({ userId }),
        });
        const data = await res.json();
        console.log('data', data);
        setIsActiveStatusInStorage(data.isActive);
        if (!data.isActive) stopBlocking();
      } catch (err) {
        console.error('Error checking subscription:', err);
        stopBlocking();
      }
    });
  }

  function setIsActiveStatusInStorage(currentStatus: boolean) {
    chrome.storage.local.get(['subscriptionData'], ({ subscriptionData }) => {
      const isActive = subscriptionData?.isActive ?? false;
      if (isActive === currentStatus) return;
      const newSubscriptionData = {
        ...subscriptionData,
        isActive: currentStatus,
      };
      chrome.storage.local.set({ subscriptionData: newSubscriptionData });
    });
  }
}
