import { webResourceItems } from '../options/components/Options/menuItems';

chrome.runtime.onMessage.addListener((message, sender, response) => {
  const { type, data } = message;

  //Убеждаемся что первоначальные настройки выполнены
  if (type === 'GET_TARGETS_BY_KEY') {
    getTargetsByKey(data).then(resp => response(resp));
  } else if (type === 'getUserDataForPopUpInfo') {
  }
  return true;
});

async function getTargetsByKey(key: string) {
  const result = await getFromLocalstorage(key);
  return result || [];
}

async function getFromLocalstorage(key: string) {
  return new Promise(resolve => {
    chrome.storage.local.get([key], result => {
      resolve(result[key]);
    });
  });
}
