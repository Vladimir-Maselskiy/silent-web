'use strict';

(async () => {
  const webResourceKey = '6';
  const selectors = [
    'div',
    'span',
    'p',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'li',
    'a',
    'img',
    'b',
  ];

  let isObserveStarted = false;
  let observer = null;
  let isStarted = false;
  const isDefaultCanBeBlocking = await chrome.runtime.sendMessage({
    type: 'GET_IS_DEFAULT_CAN_BE_BLOCKING',
  });

  if (!isDefaultCanBeBlocking) return;

  async function startScript() {
    const isBlocking = await chrome.runtime.sendMessage({
      type: 'GET_IS_BLOCKING',
    });
    if (isBlocking) {
      startBlocking();
      console.log('[all domains] startBlocking');
    } else {
      stopBlocking();
      console.log('[all domains] stopBlocking');
    }
  }

  async function startBlocking() {
    const targets = await getTargets();
    hideTargets({ targets });
    startObserber(targets);
    console.log('[all domains] targets', targets);
  }
  async function stopBlocking() {
    if (isObserveStarted) {
      observer.disconnect();
      isObserveStarted = false;
    }
    const observedTargets = document.querySelectorAll(
      '.silent-blocking-extension'
    );
    observedTargets.forEach(el => {
      el.classList.remove('silent-blocking-extension');
      el.removeAttribute('data-silent-blocking-extension');
    });
  }

  async function getTargets() {
    return await chrome.runtime.sendMessage({
      type: 'GET_TARGETS_BY_KEY',
      data: webResourceKey,
    });
  }

  function hideTargets({ targets }) {
    const targetElement = document.body;
    // const targetElement = element ? element : document.body;
    targets.forEach(target => {
      const elements = targetElement.querySelectorAll(selectors.join(','));
      elements.forEach(el => {
        const targetElement = getTargetContent({ el, target });

        if (targetElement) {
          targetElement.classList.add('silent-blocking-extension');
          targetElement.setAttribute('data-silent-blocking-extension', 'true');
        }
      });
    });
  }

  function startObserber(targets) {
    if (isObserveStarted) return;
    isObserveStarted = true;
    observer = new MutationObserver(mutations => {
      hideTargets({ targets });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  function getTargetContent({ el, target }) {
    if (el.children.length) return null;
    const { target: targetValue, ignoreCase } = target;
    const tagName = el.tagName.toLowerCase();

    const targetEl = ['b'].includes(tagName) ? el.parentNode : el;
    const elementText = targetEl.textContent;
    const isMatch = ignoreCase
      ? elementText.toLowerCase().includes(targetValue.toLowerCase())
      : elementText.includes(targetValue);
    if (!isMatch) return null;

    return targetEl;
  }

  // async function checkActiveTabAndStart() {
  //   if (isStarted) return;
  //   console.log('[Content Script] Start');

  //   const isActive = await chrome.runtime.sendMessage({
  //     type: 'CHECK_TAB_ACTIVE',
  //   });
  //   if (!isActive) {
  //     console.log('[Content Script] Вкладка не активна, зупиняюсь.');
  //     return;
  //   }

  //   console.log('[Content Script] Вкладка активна, виконую код...');
  //   console.log('[Content Script] isStarted', isStarted);
  //   isStarted = true;
  //   startScript();
  // }

  // checkActiveTabAndStart();

  // chrome.runtime.onMessage.addListener(async (request, sender, response) => {
  //   if (
  //     request.type === 'REINIT_BLOCKING' &&
  //     request.webResourceKey === webResourceKey
  //   ) {
  //     checkActiveTabAndStart();

  //     return response(true);
  //   }
  // });

  // chrome.runtime.onMessage.addListener(message => {
  //   if (message.type === 'ACTIVATE_TAB') {
  //     checkActiveTabAndStart();
  //   }
  // });

  startScript();

  chrome.runtime.onMessage.addListener(async (request, sender, response) => {
    if (request.type === 'REINIT_BLOCKING' && isDefaultCanBeBlocking) {
      startScript();

      return response(true);
    }
  });
})();
