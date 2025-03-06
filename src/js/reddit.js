'use strict';

(async () => {
  let isObserveStarted = false;
  let observer = null;

  const webResourceKey = '2';
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
  ];

  const containerSelectors = [
    'article',
    'div[data-testid*="post-unit"]',
    'li.highlight-list-item',
    'li[rpl][role="presentation"]',
    'details',
    'faceplate-tracker[source="search"][action="view"][noun="trending"]',
    'shreddit-post[post-title]',
  ];
  async function startScript() {
    let isBlocking = await chrome.runtime.sendMessage({
      type: 'GET_IS_BLOCKING',
    });

    console.log('[reddit] isBlocking', isBlocking);
    if (isBlocking) {
      startBlocking();
      console.log('[reddit] startBlocking');
    } else {
      stopBlocking();
      console.log('[reddit] stopBlocking');
    }
  }

  async function startBlocking() {
    const targets = await getTargets();
    const hideStyle = await chrome.runtime.sendMessage({ type: 'GET_STYLE' });

    hideTargets({ targets, hideStyle });
    startObserber({ targets, hideStyle });
    console.log('[reddit] targets', targets);
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
      el.classList.remove('hidden');
      el.removeAttribute('data-silent-blocking-extension');
    });
  }

  async function getTargets() {
    return await chrome.runtime.sendMessage({
      type: 'GET_TARGETS_BY_KEY',
      data: webResourceKey,
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

  function startObserber({ targets, hideStyle }) {
    if (isObserveStarted) return;
    isObserveStarted = true;
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

    // if (el && el.shadowRoot) {
    //   console.log('[reddit] targetElement shadowRoot top', el);
    //   el.shadowRoot.querySelectorAll(selectors.join(',')).forEach(el => {
    //     console.log('[reddit] targetElement shadowRoot', el);
    //     const targetElement =
    //       el.children.length &&
    //       el.textContent.toLowerCase().includes(target.target.toLowerCase())
    //         ? el
    //         : null;

    //     if (targetElement) {
    //       targetElement.style.background = 'yellow';
    //       targetElement.classList.add('silent-blocking-extension123');
    //       targetElement.setAttribute(
    //         'data-silent-blocking-extension',
    //         'true'
    //       );
    //     }
    //   });
    // }
    // if (el?.nodeName === 'IMG') {
    //   const textContent = el.alt;
    //   if (textContent.toLowerCase().includes(target.target.toLowerCase())) {
    //     el.style.maxWidth = '30%';
    //     el.classList.add('silent-blocking-extension');
    //     el.setAttribute('data-silent-blocking-extension', 'true');
    //   }
    // }
  }

  startScript();

  chrome.runtime.onMessage.addListener(async (request, sender, response) => {
    if (request.type === 'REINIT_BLOCKING') {
      startScript();

      return response(true);
    }
  });
})();
