import { domain } from '../assets/config/domain';
import { checkSubscription } from './utils/checkSubscription';
import { specialDomains } from './utils/specialDomains';

let activeTabId = null;
chrome.runtime.onMessage.addListener((message, sender, response) => {
  const { type, data } = message;

  if (type === 'GET_TARGETS') {
    getTargets().then(resp => response(resp));
  } else if (type === 'ADD_TARGET') {
    addTarget(data).then(resp => response(resp));
  } else if (type === 'DELETE_TARGET_ITEM') {
    deleteItem(data).then(resp => response(resp));
  } else if (type === 'SET_IS_BLOCKING') {
    setIsBlocking(data).then(resp => response(resp));
  } else if (type === 'GET_IS_BLOCKING') {
    getIsBlocking().then(resp => response(resp));
  } else if (type === 'GET_IS_DEFAULT_CAN_BE_BLOCKING') {
    getIsDefaultCanBeBlocking().then(resp => response(resp));
  } else if (type === 'CHECK_TAB_ACTIVE') {
    response(sender.tab.id === activeTabId);
  } else if (type === 'GET_EXCLUDED_DOMAINS') {
    getExcludedDomains().then(resp => response(resp));
  } else if (type === 'SET_EXCLUDED_DOMAINS') {
    setExcludedDomains(data).then(resp => response(resp));
  } else if (type === 'GET_IS_ACTIVE_TAB_DOMAIN_IN_EXCLUDED_DOMAINS') {
    getIsActiveTabDomainInExcludedDomains().then(resp => response(resp));
  } else if (type === 'ADD_CURRENT_DOMAIN_TO_EXCLUDED_DOMAINS') {
    addCurrentDomainToExcludedDomains().then(resp => response(resp));
  } else if (type === 'REMOVE_CURRENT_DOMAIN_FROM_EXCLUDED_DOMAINS') {
    removeCurrentDomainFromExcludedDomains().then(resp => response(resp));
  } else if (type === 'REINIT_BLOCKING') {
    reInitBlokingOnCurrentPage().then(resp => response(resp));
  } else if (type === 'SET_STYLE') {
    setStyle(data).then(resp => response(resp));
  } else if (type === 'GET_STYLE') {
    getStyle().then(resp => response(resp));
  } else if (type === 'STOP_BLOCKING') {
    stopBlocking().then(resp => response(resp));
  } else if (type === 'GOOGLE_AUTH') {
    googleAuth().then(resp => response(resp));
  }
  return true;
});

checkSubscription({ stopBlocking });

async function getTargets() {
  return (await getFromLocalstorage('targets')) || [];
}

async function addTarget(data: any) {
  const { ignoreCase, removeBlock, target } = data;
  const id = createItemId(data);
  const targets = ((await getFromLocalstorage('targets')) as any[]) || [];
  const isTargetExist = targets.find(target => target.id === id);
  if (isTargetExist) return { success: false };
  targets.push({
    id,
    key: id,
    target,
    ignoreCase,
    removeBlock,
  });
  await chrome.storage.local.set({ ['targets']: targets });
  const responseData = await getTargets();
  reInitBlokingOnCurrentPage();
  return { success: true, data: responseData };
}

async function deleteItem(data: any) {
  const { id } = data;

  const targets = ((await getFromLocalstorage('targets')) as any[]) || [];
  const currentTarget = targets.find(target => target.id === id);
  if (!currentTarget) return { success: false };
  const newTargetsData = targets.filter(target => target.id !== id);
  await chrome.storage.local.set({ ['targets']: newTargetsData });
  const responseData = await getTargets();
  return { success: true, data: responseData };
}

async function setIsBlocking(data: { isBlocking: boolean }) {
  console.log('setIsBlocking', data);
  const { isBlocking } = data;
  if (isBlocking === undefined) return { result: false };
  await chrome.storage.local.set({ isBlocking });
  reInitBlokingOnCurrentPage();
  return { result: true };
}

async function getIsBlocking() {
  const isBlocking = (await getFromLocalstorage('isBlocking')) || false;
  const raw = await getFromLocalstorage('subscriptionData');
  const isActive = (raw as any)?.isActive ?? false;
  const isActiveTabDomainInExcludedDomains =
    await getIsActiveTabDomainInExcludedDomains();
  return (
    (isActive && isBlocking && !isActiveTabDomainInExcludedDomains) || false
  );
}

async function getIsActiveTabDomainInExcludedDomains() {
  const activeTab = await getActiveTab();
  if (!activeTab) return;
  const url = new URL(activeTab.url);
  if (!url?.hostname) return;
  const domain = url.hostname;
  const excludedDomains: string[] =
    ((await getFromLocalstorage('excludedDomains')) as string[]) || [];
  return excludedDomains.includes(domain);
}

async function addCurrentDomainToExcludedDomains() {
  const activeTab = await getActiveTab();
  if (!activeTab) return { result: false };
  const url = new URL(activeTab.url);
  if (!url?.hostname) return { result: false };
  const domain = url.hostname;
  const excludedDomains: string[] =
    ((await getFromLocalstorage('excludedDomains')) as string[]) || [];
  if (excludedDomains.includes(domain)) return { result: false };
  excludedDomains.push(domain);
  await setExcludedDomains(excludedDomains);
  return { result: true };
}

async function removeCurrentDomainFromExcludedDomains() {
  const activeTab = await getActiveTab();
  if (!activeTab) return { result: false };
  const url = new URL(activeTab.url);
  if (!url?.hostname) return { result: false };
  const domain = url.hostname;
  const excludedDomains: string[] =
    ((await getFromLocalstorage('excludedDomains')) as string[]) || [];
  if (!excludedDomains.includes(domain)) return { result: false };
  excludedDomains.splice(excludedDomains.indexOf(domain), 1);
  await setExcludedDomains(excludedDomains);
  return { result: true };
}

async function getActiveTab() {
  const activeTab = await chrome.tabs.query({
    active: true,
  });

  return activeTab[0] || null;
}

async function getIsDefaultCanBeBlocking() {
  const activeTab = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (!activeTab[0]?.url) return;
  const url = new URL(activeTab[0].url);
  if (!url?.hostname) return;
  const domain = url.hostname;
  const isSpecialDomain = specialDomains.some(specialDomain =>
    domain.includes(specialDomain)
  );
  return !isSpecialDomain;
}

async function getExcludedDomains() {
  const excludedDomains = (await getFromLocalstorage('excludedDomains')) || [];
  return excludedDomains;
}

async function setExcludedDomains(excludedDomains: string[]) {
  await chrome.storage.local.set({ excludedDomains });
  return { result: true };
}

function createItemId(data) {
  const { ignoreCase, removeBlock, webResourceKey, target } = data;
  const id =
    webResourceKey +
    (ignoreCase ? target.toLowerCase() : target) +
    (removeBlock ? '1' : '0');
  return id;
}

async function reInitBlokingOnCurrentPage() {
  const activeTab = await getActiveTab();
  if (!activeTab) return;
  chrome.tabs.sendMessage(
    activeTab.id,
    {
      type: 'REINIT_BLOCKING',
    },
    _ => {
      if (chrome.runtime.lastError) {
        console.warn(
          'Options page is not available:',
          chrome.runtime.lastError
        );
      }
    }
  );
}

async function setStyle(view: 'on' | 'off') {
  if (!view) return;
  await chrome.storage.local.set({ style: view });
  reInitBlokingOnCurrentPage();
}

async function getStyle() {
  return (await getFromLocalstorage('style')) || 'on';
}

async function stopBlocking() {
  setIsBlocking({ isBlocking: false });
  reInitBlokingOnCurrentPage();
}

async function googleAuth() {
  return new Promise(resolve => {
    const CLIENT_ID =
      '84396342494-7d7l4g8uaof8vjqdf6n209cjv38a2che.apps.googleusercontent.com';
    const REDIRECT_URI = chrome.identity.getRedirectURL();
    const SCOPES = 'profile email';

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth` +
      `?client_id=${CLIENT_ID}` +
      `&response_type=token` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&scope=${encodeURIComponent(SCOPES)}` +
      `&prompt=select_account`;

    chrome.identity.launchWebAuthFlow(
      { url: authUrl, interactive: true },
      async redirectUrl => {
        if (chrome.runtime.lastError) return;

        const params = new URLSearchParams(
          new URL(redirectUrl).hash.substring(1)
        );
        const accessToken = params.get('access_token');

        if (!accessToken) return;

        fetch(`${domain}/api/users/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken }),
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              chrome.storage.local.set({
                userId: data.user._id,
                email: data.user.email,
              });
              resolve({ success: true, data: data.user });
            } else {
              resolve({ success: false, data });
            }
          })
          .catch(error => {
            console.error('Error on googleAuth:', error);
            resolve({ success: false, data: error });
          });
      }
    );
  });
}

async function getFromLocalstorage(key: string) {
  return new Promise(resolve => {
    chrome.storage.local.get([key], result => {
      resolve(result[key]);
    });
  });
}

chrome.tabs.onActivated.addListener(async activeInfo => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (!tab.url || tab.url.startsWith('chrome://')) return;
    reInitBlokingOnCurrentPage();
  } catch (error) {
    console.error('Error on tabs.onActivated:', error);
  }
});
