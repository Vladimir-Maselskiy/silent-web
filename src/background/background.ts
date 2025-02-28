chrome.runtime.onMessage.addListener((message, sender, response) => {
  const { type, data } = message;

  if (type === 'GET_TARGETS_BY_KEY') {
    getTargetsByKey(data).then(resp => response(resp));
  } else if (type === 'ADD_ITEM') {
    addItem(data).then(resp => response(resp));
  } else if (type === 'DELETE_TARGET_ITEM') {
    deleteItem(data).then(resp => response(resp));
  } else if (type === 'SET_IS_CURRENT_DOMAIN_BLOCKING') {
    setIsCurrentDomainBlocking(data).then(resp => response(resp));
  } else if (type === 'GET_IS_CURRENT_DOMAIN_BLOCKING') {
    getIsCurrentDomainBlocking(data).then(resp => response(resp));
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

async function setIsCurrentDomainBlocking(data: {
  isBlocking: boolean;
  webResourceKey: string;
}) {
  const { isBlocking, webResourceKey } = data;
  const blockingData = (await getFromLocalstorage('blockingData')) || {};
  blockingData[webResourceKey] = isBlocking;
  await chrome.storage.local.set({ blockingData });
  reInitBlokingOnCurrentPage({ webResourceKey, isBlocking });
  return { result: true };
}

async function getIsCurrentDomainBlocking(key: string) {
  const blockingData = (await getFromLocalstorage('blockingData')) || {};
  return blockingData[key] || false;
}

function createItemId(data) {
  const { ignoreCase, removeBlock, webResourceKey, target } = data;
  const id =
    webResourceKey +
    (ignoreCase ? target.toLowerCase() : target) +
    (removeBlock ? '1' : '0');
  return id;
}

async function reInitBlokingOnCurrentPage({
  webResourceKey,
  isBlocking,
}: {
  webResourceKey: string;
  isBlocking: boolean;
}) {
  const activeTab = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (!activeTab[0]) return;
  await chrome.tabs.sendMessage(activeTab[0].id, {
    type: 'REINIT_BLOCKING',
    webResourceKey,
    isBlocking,
  });
}

async function getFromLocalstorage(key: string) {
  return new Promise(resolve => {
    chrome.storage.local.get([key], result => {
      resolve(result[key]);
    });
  });
}
