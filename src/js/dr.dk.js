'use strict';

(async () => {
  let observer = null;

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
    //   'reddit-recent-pages', //shadowRoot
    //   'shreddit-subreddit-header', //shadowRoot
    'img',
    'strong',
  ];

  const containerSelectors = [
    'article',
    'div[role="listitem"]',
    'li.dre-slide-band-track__item',
    'a.carousel-item',
    'a.packshot.packshot-list__packshot',
    'div.d1-drtv-episode',
    'li[class^="LiveBar_Channel"]',
    'li[class^="HeroBand_item"]',
    'li[class^="ChannelSchedule_item"]',
    'div[class^="Spot_spot"]',
    'div.dre-teaser',
  ];

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

    hideTargets({ targets, hideStyle });
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

  function hideTargets({ targets, hideStyle }) {
    const targetElement = document.body;
    // const targetElement = element ? element : document.body;
    targets.forEach(target => {
      const elements = targetElement.querySelectorAll(selectors.join(','));
      elements.forEach(el => {
        const targetElement = getTargetContent({ el, target });

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
  function hideShadowDaomTargets({ targets, hideStyle }) {
    const targetElement = document.body;
    // const targetElement = element ? element : document.body;
    targets.forEach(target => {
      const elements = targetElement.querySelectorAll(
        shadowDomSelectors.map(({ selector }) => selector).join(',')
      );
      elements.forEach(el => {
        const targetElement = getShadowDomTargetContent({ el, target });

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
      hideTargets({ targets, hideStyle });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  function getTargetContent({ el, target }) {
    if (el.children.length) return null;
    const { target: targetValue, ignoreCase, removeBlock } = target;
    const elementText = el.textContent;
    const isMatch = ignoreCase
      ? elementText.toLowerCase().includes(targetValue.toLowerCase())
      : elementText.includes(targetValue);
    if (!isMatch) return null;

    const targetContent = removeBlock
      ? el.closest(containerSelectors.join(','))
      : el;
    console.log('[reddit] targetValue', targetValue);
    if (targetContent) {
      return targetContent;
    }
    return el;
  }
  function getShadowDomTargetContent({ el, target }) {
    if (!el || !el.shadowRoot) return null;
    const { target: targetValue, ignoreCase } = target;
    const elementText = el.textContent;
    const isMatch = ignoreCase
      ? elementText.toLowerCase().includes(targetValue.toLowerCase())
      : elementText.includes(targetValue);
    if (isMatch) {
      const tagName = el.tagName.toLowerCase();
      const currentSelector = shadowDomSelectors.find(
        shadowDomSelector => shadowDomSelector.selector === tagName
      );
      if (!currentSelector) return null;
      const targetEl = el.closest(currentSelector.containerSelector);

      return targetEl;
    }
    return null;
  }

  startScript();

  chrome.runtime.onMessage.addListener(async (request, sender, response) => {
    if (request.type === 'REINIT_BLOCKING') {
      startScript();

      return response(true);
    }
  });
})();
