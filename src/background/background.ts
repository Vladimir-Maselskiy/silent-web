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
  }
  return true;
});

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
  const { isBlocking } = data;
  if (isBlocking === undefined) return { result: false };
  await chrome.storage.local.set({ isBlocking });
  reInitBlokingOnCurrentPage();
  return { result: true };
}

async function getIsBlocking() {
  const isBlocking = (await getFromLocalstorage('isBlocking')) || false;
  const isActiveTabDomainInExcludedDomains =
    await getIsActiveTabDomainInExcludedDomains();
  return (isBlocking && !isActiveTabDomainInExcludedDomains) || false;
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
  return !specialDomains.includes(domain);
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
