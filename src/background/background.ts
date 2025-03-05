import { specialDomains } from './utils/specialDomains';

let activeTabId = null;
chrome.runtime.onMessage.addListener((message, sender, response) => {
  const { type, data } = message;

  if (type === 'GET_TARGETS_BY_KEY') {
    getTargetsByKey(data).then(resp => response(resp));
  } else if (type === 'ADD_ITEM') {
    addItem(data).then(resp => response(resp));
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
  }
  return true;
});

async function getTargetsByKey(key: string) {
  const result = await getFromLocalstorage(key);
  return result || [];
}

async function addItem(data: any) {
  const { ignoreCase, removeBlock, webResourceKey, target } = data;
  const id = createItemId(data);
  const webResourceData =
    ((await getFromLocalstorage(webResourceKey)) as any[]) || [];
  const isItemExist = webResourceData.find(item => item.id === id);
  if (isItemExist) return { success: false };
  webResourceData.push({
    id,
    target,
    ignoreCase,
    removeBlock,
  });
  await chrome.storage.local.set({ [webResourceKey]: webResourceData });
  return { success: true, data: webResourceData };
}
async function deleteItem(data: any) {
  const { id, webResourceKey } = data;

  const webResourceData =
    ((await getFromLocalstorage(webResourceKey)) as any[]) || [];
  const currentItem = webResourceData.find(item => item.id === id);
  if (!currentItem) return { success: false };
  const newWebResourceData = webResourceData.filter(item => item.id !== id);
  await chrome.storage.local.set({ [webResourceKey]: newWebResourceData });
  return { success: true, data: newWebResourceData };
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
  return isBlocking || false;
}

async function getIsDefaultCanBeBlocking() {
  const activeTab = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (!activeTab[0]) return;
  const url = new URL(activeTab[0].url);
  if (!url?.hostname) return;
  const domain = url.hostname;
  return !specialDomains.includes(domain);
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
  const activeTab = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (!activeTab[0]) return;
  await chrome.tabs.sendMessage(activeTab[0].id, {
    type: 'REINIT_BLOCKING',
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
    console.error('Помилка при оновленні вкладки:', error);
  }
});
