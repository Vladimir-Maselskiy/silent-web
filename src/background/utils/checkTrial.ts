import { domain } from '../../assets/config/domain';

async function shouldTrialPeriod() {
  return new Promise(resolve => {
    chrome.storage.local.get('lastTrialCheck', result => {
      const last = result.lastTrialCheck
        ? new Date(result.lastTrialCheck)
        : null;
      const now = new Date();

      if (!last || (Number(now) - Number(last)) / 1000 > 3600) {
        // 1 hour
        chrome.storage.local.set({ lastTrialCheck: now.toISOString() });
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

export async function isTrialPeriodActive() {
  const shouldCheck = await shouldTrialPeriod();
  if (!shouldCheck) return;

  const res = await fetch(`${domain}/api/check-trial`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (res.status === 401) {
    // токен невалідний — логіка деавторизації
    chrome.storage.local.remove(['accessToken', 'user']);
    alert('Your session expired. Please log in again.');
  }
}
