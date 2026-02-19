'use strict';

(async () => {
  const containerSelectors = [
    'div[id*="news-feed"].news-feed',
    'a[id*="mntl-card-list-items"]',
    'div[id*="star-tracks__inner-wrapper--body"]',
    'a[id*="primary-block__topStory"]',
    'div[id*="recirc-lead__card-list-items"]',
    'div.ob-dynamic-rec-container[data-pos]',
    'figure[id*="figure-article"]',
    'figure[id*="mntl-sc-block"]',
    'li[id*="mntl-carousel__item"]',
  ];

  const shadowDomSelectors = [];
  const hideTargetsModuleImport = import(
    chrome.runtime.getURL('utils/hideTargets.js')
  );

  const selectorsModuleImport = import(
    chrome.runtime.getURL('utils/getDefaultSelectors.js')
  );

  const getShadowDomTargetContentModuleImport = import(
    chrome.runtime.getURL('utils/getShadowDomTargetContent.js')
  );

  const hideShadowDomTargetsModuleImport = import(
    chrome.runtime.getURL('utils/hideShadowDomTargets.js')
  );
  const [
    hideTargetsModule,
    defaultSelectors,
    getShadowDomTargetContentModule,
    hideShadowDomTargetsModule,
  ] = await Promise.all([
    hideTargetsModuleImport,
    selectorsModuleImport,
    getShadowDomTargetContentModuleImport,
    hideShadowDomTargetsModuleImport,
  ]);

  const selectors = defaultSelectors.getDefaultSelectors();
  let observer = null;

  async function startScript() {
    let isBlocking = await chrome.runtime.sendMessage({
      type: 'GET_IS_BLOCKING',
    });

    if (isBlocking) {
      startBlocking();
    } else {
      stopBlocking();
    }
  }
  const throttledHideTargets = throttle(hideTargetsModule.hideTargets, 1000);

  function throttle(func, delay) {
    let lastCall = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    };
  }

  async function startBlocking() {
    const targets = await getTargets();
    const hideStyle = await chrome.runtime.sendMessage({ type: 'GET_STYLE' });

    hideTargetsModule.hideTargets({
      targets,
      hideStyle,
      selectors,
      containerSelectors,
    });
    // hideShadowDomTargetsModule.hideShadowDomTargets({
    //   targets,
    //   hideStyle,
    //   shadowDomSelectors,
    //   getShadowDomTargetContentModule,
    // });

    startObserber({ targets, hideStyle });
  }

  async function stopBlocking() {
    observer && observer.disconnect();

    const observedTargets = document.querySelectorAll(
      '.silent-blocking-extension'
    );
    observedTargets.forEach(el => {
      el.classList.remove('silent-blocking-extension');
      el.classList.remove('hidden');
      el.removeAttribute('data-silent-blocking-extension');
    });
  }

  async function getTargets() {
    return await chrome.runtime.sendMessage({
      type: 'GET_TARGETS',
    });
  }

  function startObserber({ targets, hideStyle }) {
    observer && observer.disconnect();
    observer = new MutationObserver(mutations => {
      throttledHideTargets({
        targets,
        hideStyle,
        selectors,
        containerSelectors,
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  startScript();

  chrome.runtime.onMessage.addListener(async (request, sender, response) => {
    if (request.type === 'REINIT_BLOCKING') {
      startScript();
      response(true);
    }
    return true;
  });
})();
