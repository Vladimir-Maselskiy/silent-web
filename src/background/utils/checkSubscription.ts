import { domain } from '../../assets/config/domain';

const CHECK_INTERVAL_MINUTES = 0.5;

export function checkSubscription() {
  chrome.alarms.create('checkSubscription', {
    periodInMinutes: CHECK_INTERVAL_MINUTES,
  });

  chrome.alarms.onAlarm.addListener(alarm => {
    if (alarm.name === 'checkSubscription') {
      console.log('Checking subscription status...');
      chrome.storage.local.get(['userId'], async ({ userId }) => {
        if (!userId) {
          return;
        }

        try {
          const res = await fetch(`${domain}/api/check-subscription`, {
            method: 'POST',
            body: JSON.stringify({ userId }),
          });
          const data = await res.json();
          console.log('data', data);
          // setIsSubscriptionActive(data.isActive);
          // setIsTrial(data.isTrial);

          chrome.storage.local.set({ isSubscriptionActive: data.isActive });
        } catch (err) {
          console.error('Error checking subscription:', err);
          // setIsSubscriptionActive(false);
        }
      });
    }
  });
}
