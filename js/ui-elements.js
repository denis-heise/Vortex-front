const handleTabClick = (evt) => {
	const clickedTab = evt.target.closest('[data-tab]');
	if (!clickedTab) return;

	const parent = clickedTab.closest('[data-block="parent"]');
	if (!parent) return;

	const targetValue = clickedTab.dataset.tab;
	const tabs = parent.querySelectorAll('[data-tab]');
	const panels = parent.querySelectorAll('[data-panel]');

	tabs.forEach((btn) => {
		if (btn === clickedTab) {
			btn.className = 'button';
			btn.setAttribute('aria-selected', 'true');
			btn.removeAttribute('tabindex');
		} else {
			btn.className = 'button button--transparent';
			btn.setAttribute('aria-selected', 'false');
			btn.setAttribute('tabindex', '-1');
		}
	});

	panels.forEach((panel) => {
		panel.classList.toggle('is-hidden', panel.dataset.panel !== targetValue);
	});
};

const initTabs = () => {
	window.addEventListener('click', handleTabClick);

	return () => {
		window.removeEventListener('click', handleTabClick);
	};
};

const setActiveTab = (activeTab, allTabs) => {
    const tabsArray = Array.from(allTabs);
    const hasActiveSystem = tabsArray.some(tab => tab.classList.contains('is-active'));
    const currentActiveTab = tabsArray.find(tab => tab.getAttribute('aria-selected') === 'true') || tabsArray;

    if (currentActiveTab && currentActiveTab !== activeTab) {
        const filterFn = cls => cls.startsWith('button--');

        const oldBtnClasses = Array.from(currentActiveTab.classList).filter(filterFn);
        const newBtnClasses = Array.from(activeTab.classList).filter(filterFn);

        currentActiveTab.classList.remove(...oldBtnClasses);
        currentActiveTab.classList.add(...newBtnClasses);

        activeTab.classList.remove(...newBtnClasses);
        activeTab.classList.add(...oldBtnClasses);
    }

    tabsArray.forEach((tab) => {
        const isActive = tab === activeTab;

        if (hasActiveSystem) {
            tab.classList.toggle('is-active', isActive);
        }

        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        if (isActive) {
            tab.removeAttribute('tabindex');
        } else {
            tab.setAttribute('tabindex', '-1');
        }
    });
};

const initTabsGeneric = (containerSelector, tabAttr, contentSelector = '') => {
	if (!containerSelector) {
		const tabs = document.querySelectorAll(`[${tabAttr}]`);

		tabs.forEach((tab) => {
			tab.addEventListener('click', () => {
				const parent = tab.closest('[data-block="parent"]');
				const targetId = tab.getAttribute(tabAttr);
				const insideTabs = parent.querySelectorAll(`[${tabAttr}]`);

				const classesToRemove = Array.from(parent.classList).filter(className => className.startsWith('type-'));
				parent.classList.remove(...classesToRemove);
				setActiveTab(tab, insideTabs);

				parent.classList.add(`type-${targetId}`);
			});
		});
	} else {
		const container = document.querySelector(containerSelector);
		if (!container) return;

		const tabs = container.querySelectorAll(`[${tabAttr}]`);
		const blocks = document.querySelectorAll(`[${contentSelector}]`);

		tabs.forEach((tab) => {
			tab.addEventListener('click', () => {
				if (tab.getAttribute('aria-selected') === 'true') return;

				const targetId = tab.getAttribute(tabAttr);
				setActiveTab(tab, tabs);

				blocks.forEach((block) => {
					const blockId = block.getAttribute(contentSelector);
					block.classList.toggle('is-hidden', blockId !== targetId);
				});

				if(tabAttr === 'data-tab-products' && typeof alignHeightsInParent === 'function') {
					alignHeightsInParent('[data-element="organization-title"]');
					alignHeightsInParent('[data-element="organization-subtitle"]');
				}
			});
		});
	}
};

const initRadioSynchronizer = () => {
    document.addEventListener('change', (evt) => {
        if (evt.detail && evt.detail.isSynced) return;

        const radio = evt.target;
        if (!radio.matches('input[type="radio"]') || !radio.hasAttribute('data-sync-radio')) return;

        const syncGroup = radio.closest('[data-sync-group="radio"]');
        if (!syncGroup) return;

        const targetValue = radio.value;
        const groupRadios = syncGroup.querySelectorAll('input[type="radio"][data-sync-radio]');

        groupRadios.forEach((item) => {
            if (item.value === targetValue && item !== radio) {
                item.checked = true;
                item.dispatchEvent(new CustomEvent('change', {
                    bubbles: true,
                    detail: { isSynced: true }
                }));
            }
        });
    });
};

const initDuplicateElements = () => {
    document.addEventListener('click', (evt) => {
        const targetBtn = evt.target.closest('[data-button="duplicate"]');
        if (!targetBtn) return;

        evt.preventDefault();

        const parent = targetBtn.closest('[data-block="parent"]');
        if (!parent) return;

        const original = parent.querySelector('[data-element="duplicate"]');
        if (!original) return;

        const parentOriginal = original.parentElement;
        if (!parentOriginal) return;

        const clone = original.cloneNode(true);

        const inputs = clone.querySelectorAll('input, textarea, select');
        const selects = clone.querySelectorAll('[data-select-item]');

        inputs?.forEach((input) => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else {
                input.value = '';
            }
        });

        selects?.forEach(select => select.classList.remove('is-selected'));

        const defaultTextElements = clone.querySelectorAll('[data-default-text]');
        const isMobile = window.matchMedia('(max-width: 625px)').matches;

        defaultTextElements.forEach((element) => {
            const mobileText = element.getAttribute('data-mobile-text');
            const defaultText = element.getAttribute('data-default-text');

            if (isMobile && mobileText !== null) {
                element.innerHTML = mobileText;
            } else if (defaultText !== null) {
                element.innerHTML = defaultText;
            }
        });

        parentOriginal.appendChild(clone);
    });
};

const initDynamicContainerCloner = (btnSelector, parentSelector, targetSelector, maxCopies, fallbackHtml) => {
    const updateButtonVisibility = (parent) => {
        const btn = parent.querySelector(btnSelector);
        if (!btn) return;

        const currentCopies = parent.querySelectorAll(targetSelector);
        if (currentCopies.length >= maxCopies) {
            btn.classList.add('is-hidden');
        } else {
            btn.classList.remove('is-hidden');
        }
    };

    document.addEventListener('click', (evt) => {
        const btn = evt.target.closest(btnSelector);
        if (!btn) return;

        const parent = btn.closest(parentSelector);
        if (!parent) return;

        const currentCopies = parent.querySelectorAll(targetSelector);
        if (currentCopies.length >= maxCopies) return;

        const original = parent.querySelector(targetSelector);
        const uniqueIdSuffix = Date.now();

        if (original) {
            const clone = original.cloneNode(true);

            clone.querySelectorAll('input, select, textarea').forEach((input) => {
                input.value = '';
                if (input.type === 'checkbox' || input.type === 'radio') {
                    input.checked = false;
                }

                if (input.id) {
                    const baseId = input.id.split('_');
                    const newId = `${baseId}_${uniqueIdSuffix}`;

                    const wrapper = input.closest('[data-wrapper-input]') || input.closest('.wrapper-input');
                    if (wrapper) {
                        const label = wrapper.querySelector('label');
                        if (label) label.setAttribute('for', newId);
                        wrapper.classList.remove('is-error', 'filled');
                    }

                    input.id = newId;
                } else {
                    const wrapper = input.closest('[data-wrapper-input]') || input.closest('.wrapper-input');
                    if (wrapper) wrapper.classList.remove('is-error', 'filled');
                }
            });

            const allCopies = parent.querySelectorAll(targetSelector);
            const lastCopy = allCopies[allCopies.length - 1];
            lastCopy.after(clone);
        } else if (fallbackHtml) {
            const formattedHtml = fallbackHtml.replace(/_ID_SUFFIX_/g, uniqueIdSuffix);
            parent.insertAdjacentHTML('afterbegin', formattedHtml.trim());
        }

        updateButtonVisibility(parent);

        const parentForm = btn.closest('form');
        if (parentForm) {
            const submitBtn = parentForm.querySelector('[type="submit"]') || parentForm.querySelector('.total-info__submit');
            if (submitBtn) {
                submitBtn.disabled = true;
            }
        }
    });

    document.querySelectorAll(parentSelector).forEach((parent) => {
        updateButtonVisibility(parent);
    });
};

const initTableToggle = (triggerSelector, blockSelector, dataAttribute) => {
	const triggers = document.querySelectorAll(`[${triggerSelector}]`);
	if (!triggers.length) return;

	triggers.forEach((trigger) => {
		trigger.addEventListener('click', () => {
			const targetValue = trigger.getAttribute(triggerSelector);
			const allBlocks = document.querySelectorAll(blockSelector);

			allBlocks.forEach((block) => {
				const blockValue = block.getAttribute(`data-${dataAttribute}`);

				if (blockValue === targetValue) {
					block.classList.remove('is-hidden');
				} else {
					block.classList.add('is-hidden');
				}
			});
		});
	});
};

const initSidebarNavigation = () => {
	const menuLinks = document.querySelectorAll('[data-element="sidebar-link"]');
	if (menuLinks.length === 0) return;

	let currentPath = window.location.pathname.replace(/^\/|\/$/g, '');
	if (currentPath === '' || currentPath === 'index.html') {
		currentPath = '/';
	}

	menuLinks.forEach((link) => {
		let linkHref = link.getAttribute('href').replace(/^\/|\/$/g, '');
		if (linkHref === '') {
			linkHref = '/';
		}

		const isCurrentPage = currentPath === linkHref || window.location.pathname.endsWith(linkHref);

		if (isCurrentPage) {
			link.classList.add('is-active');
		} else {
			link.classList.remove('is-active');
		}
	});
};

const initBackNavigation = () => {
	const backLinks = document.querySelectorAll('[data-element="back-link"]');

	backLinks.forEach((backLinkItem) => {
		backLinkItem.addEventListener('click', (evt) => {
			if (document.referrer && window.history.length > 1) {
				evt.preventDefault();
				window.history.back();
			}
		});
	});
};

const initToggleButtons = (buttons, activeClass, eventType = 'click', popupManager = null) => {
    buttons?.forEach((button) => {
        button.addEventListener(eventType, (evt) => {
            const parent = button.closest('[data-block="parent"]');
            const isCurrentlyActive = button.classList.contains(activeClass);

            if (button.classList.contains('header__control-btn--burger') && !isCurrentlyActive && popupManager) {
                popupManager.closeAllPopups();
            }

            if (parent) {
                const selector = button.hasAttribute('data-button')
                    ? `[data-button="${button.getAttribute('data-button')}"]`
                    : `.${button.classList}`;

                parent.querySelectorAll(selector).forEach((item) => {
                    item.classList.remove(activeClass);
                });
            }

            if (!isCurrentlyActive) {
                button.classList.add(activeClass);
            } else {
                button.classList.remove(activeClass);
            }

            if (button.classList.contains('header__control-btn--burger')) {
                const isMenuOpen = button.classList.contains(activeClass);
                if (typeof toggleScroll === 'function') toggleScroll(isMenuOpen);
            }
        });
    });
};
