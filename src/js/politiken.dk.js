'use strict';

(async () => {
  const hideTargetsModuleImport = import(
    chrome.runtime.getURL('utils/hideTargets.js')
  );

  const selectorsModuleImport = import(
    chrome.runtime.getURL('utils/getDefaultSelectors.js')
  );

  const getShadowDomTargetContentModuleImport = import(
    chrome.runtime.getURL('utils/getShadowDomTargetContent.js')
  );
  const [hideTargetsModule, defaultSelectors, getShadowDomTargetContentModule] =
    await Promise.all([
      hideTargetsModuleImport,
      selectorsModuleImport,
      getShadowDomTargetContentModuleImport,
    ]);

  const selectors = defaultSelectors.getDefaultSelectors();
  console.log('[dr.dk] hideTargetsModule', hideTargetsModule);
  let observer = null;

  const containerSelectors = ['article', 'a.list-item'];

  const shadowDomSelectors = [
    {
      selector: 'faceplate-screen-reader-content',
      containerSelector: 'div[data-testid="search-post-unit"]',
    },
  ];

  async function startScript() {
    let isBlocking = await chrome.runtime.sendMessage({
      type: 'GET_IS_BLOCKING',
    });

    console.log('[dr.dk] isBlocking', isBlocking);
    if (isBlocking) {
      startBlocking();
      console.log('[dr.dk] startBlocking');
    } else {
      stopBlocking();
      console.log('[dr.dk] stopBlocking');
    }
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
    hideShadowDaomTargets({ targets, hideStyle });

    startObserber({ targets, hideStyle });
    console.log('[dr.dk] targets', targets);
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

  function hideShadowDaomTargets({ targets, hideStyle }) {
    const targetElement = document.body;
    // const targetElement = element ? element : document.body;
    targets.forEach(target => {
      const elements = targetElement.querySelectorAll(
        shadowDomSelectors.map(({ selector }) => selector).join(',')
      );
      elements.forEach(el => {
        const targetElement =
          getShadowDomTargetContentModule.getShadowDomTargetContent({
            el,
            target,
            shadowDomSelectors,
          });

        if (targetElement) {
          targetElement.classList.add('silent-blocking-extension');
          hideStyle === 'off'
            ? targetElement.classList.add('hidden')
            : targetElement.classList.remove('hidden');
          targetElement.setAttribute('data-silent-blocking-extension', 'true');
        }
      });
    });
  }

  function startObserber({ targets, hideStyle }) {
    observer && observer.disconnect();
    observer = new MutationObserver(mutations => {
      hideTargetsModule.hideTargets({
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

      return response(true);
    }
  });
})();
