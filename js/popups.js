const toggleScroll = (hidden = false) => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const headerElement = document.querySelector('header');

    if (hidden) {
        document.documentElement.style.overflow = 'hidden';
        document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
        if (headerElement) {
            headerElement.style.paddingRight = `${scrollbarWidth}px`;
        }
    } else {
        document.documentElement.style.overflow = '';
        document.documentElement.style.paddingRight = '';
        if (headerElement) {
            headerElement.style.paddingRight = '';
        }
    }
};

const initPopupManager = () => {
    const openButtons = document.querySelectorAll('[data-button-open]');
    const popups = document.querySelectorAll('[data-popup]');
    const otherOverlay = document.querySelector('[data-popup="other"]');

    let touchStartY = 0;
    let touchCurrentY = 0;
    let activePopup = null;

    const resetPopupState = (popup) => {
        popup.classList.add('is-hidden');
        popup.classList.remove('is-full');
        popup.style.transform = '';
        popup.style.transition = '';

        const key = popup.getAttribute('data-popup');
        document.querySelectorAll(`[data-button-open="${key}"], [data-button="open"]`).forEach((btn) => {
            btn.classList.remove('is-open');
        });

        const selectBlocks = popup.querySelectorAll('[data-block="select"]');
        selectBlocks.forEach((block) => {
            const selectTitleEl = block.querySelector('[data-element="select-title"]');

            if (selectTitleEl) {
                let defaultText = selectTitleEl.getAttribute('data-default-text') || selectTitleEl.innerHTML;

                const txt = document.createElement('textarea');
                txt.innerHTML = defaultText;

                selectTitleEl.innerHTML = txt.value;
            }

            const items = block.querySelectorAll('[data-select-item]');
            items.forEach((item) => {
                item.classList.remove('is-selected');
                item.setAttribute('aria-selected', 'false');
            });

            const button = block.querySelector('[data-element="select-button"]');
            if (button) {
                button.setAttribute('aria-expanded', 'false');
            }
            block.classList.remove('is-open');

            const wrapper = block.closest('[data-select-wrapper]');
            if (wrapper) wrapper.classList.remove('is-open');
        });

        const scrollableBlocks = popup.querySelectorAll('[data-scrollable-block]');
        scrollableBlocks.forEach((block) => {
            setTimeout(() => {
                if (typeof SimpleBar !== 'undefined' && SimpleBar.instances.has(block)) {
                    const simpleBarInstance = SimpleBar.instances.get(block);
                    if (simpleBarInstance) {
                        simpleBarInstance.getScrollElement().scrollTop = 0;
                    }
                } else {
                    block.scrollTop = 0;
                }
                block.style.height = '';
                const simpleBarContent = block.querySelector('.simplebar-content');
                if (simpleBarContent) simpleBarContent.style.paddingBottom = '';
            }, 350);
        });

        const inputs = popup.querySelectorAll('input:not([data-quantity-input]), textarea');
        inputs.forEach((input) => {
            if (input.type === 'checkbox' || input.type === 'radio') return;
            input.value = '';
            input.classList.remove('is-full');
            const wrapper = input.closest('[data-wrapper-input]');
            if (wrapper) wrapper.classList.remove('is-full');
        });

        if (popup.getAttribute('data-popup') === 'edit-address') {
            if (typeof ymaps !== 'undefined' && window.mapInstance && window.mainPlacemarkInstance) {
                const defaultCoords = [55.755864, 37.617698];
                const selectedItems = popup.querySelectorAll('[data-block="pickup-point"]');
                window.mainPlacemarkInstance.geometry.setCoordinates(defaultCoords);
                window.mainPlacemarkInstance.properties.set('iconCaption', 'Укажите адрес на карте');
                window.mapInstance.setCenter(defaultCoords, 12);
                popup.classList.remove('is-selected');
                selectedItems?.forEach(item => item.classList.remove('is-selected'));
            }
        }

		if (popup.getAttribute('data-popup') === 'login' && !popup.classList.contains('is-registration')) {
			if (typeof window.toggleElements === 'function') {
				setTimeout(() => {
					window.toggleElements(popup, 'auth');
				}, 350);
			}
		}
    };

    const closeAllPopups = (excludePopupKey = null) => {
        popups.forEach((popup) => {
            if (popup.classList.contains('is-hidden')) return;
            if (excludePopupKey && popup.getAttribute('data-popup') === excludePopupKey) return;

            if (window.innerWidth <= 650) {
                popup.style.transition = 'transform 0.4s cubic-bezier(0.32, 0.94, 0.6, 1)';
                popup.style.transform = 'translateY(100vh)';

                const onTransitionEnd = () => {
                    resetPopupState(popup);
                    popup.removeEventListener('transitionend', onTransitionEnd);
                };
                popup.addEventListener('transitionend', onTransitionEnd);
            } else {
                resetPopupState(popup);
            }
        });

        if (!excludePopupKey) {
            toggleScroll(false);
        }
    };

    document.addEventListener('touchstart', (evt) => {
        if (window.innerWidth > 650) return;

        const headerPopup = evt.target.closest('[data-block="header-popup"]');
        if (!headerPopup) return;

        activePopup = headerPopup.closest('[data-popup]');
        if (!activePopup) return;

        touchStartY = evt.touches.clientY;
        touchCurrentY = touchStartY;
        activePopup.style.transition = 'none';
    }, { passive: true });

    document.addEventListener('touchmove', (evt) => {
        if (!activePopup || window.innerWidth > 650) return;

        touchCurrentY = evt.touches.clientY;
        const deltaY = touchCurrentY - touchStartY;

        if (deltaY > 0) {
            activePopup.style.transform = `translateY(${deltaY}px)`;
        }
    }, { passive: true });

    document.addEventListener('touchend', () => {
        if (!activePopup || window.innerWidth > 650) return;

        const deltaY = touchCurrentY - touchStartY;
        const closingPopup = activePopup;

        if (deltaY > 50) {
            closingPopup.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.94, 0.6, 1)';
            closingPopup.style.transform = 'translateY(150%)';

            if (closingPopup.getAttribute('data-popup') === 'edit-address' && document.querySelector('[data-popup="edit-delivery"]:not(.is-hidden)')) {
                resetPopupState(closingPopup);
            } else {
                otherOverlay?.classList.add('is-hidden');
                toggleScroll(false);
                const onTransitionEnd = () => {
                    resetPopupState(closingPopup);
                    closingPopup.removeEventListener('transitionend', onTransitionEnd);
                };
                closingPopup.addEventListener('transitionend', onTransitionEnd);
            }
        } else {
            closingPopup.style.transition = 'transform 0.3s ease';
            closingPopup.style.transform = '';
        }

        activePopup = null;
        touchStartY = 0;
        touchCurrentY = 0;
    });

    openButtons.forEach((btn) => {
        btn.addEventListener('click', (evt) => {
            evt.preventDefault();
            const popupKey = btn.getAttribute('data-button-open');
            const targetPopup = document.querySelector(`[data-popup="${popupKey}"]`);
            const parent = btn.closest('[data-block="parent"]');

            if (!targetPopup) return;

            if (typeof header !== 'undefined' && header) header.classList.remove('header--background');

            if (window.innerWidth > 1024) {
                if (popupKey === 'edit-address' && btn.closest('[data-popup="edit-delivery"]')) {
                    closeAllPopups('edit-delivery');
                } else {
                    closeAllPopups();
                }
            }

            if (popupKey === 'edit-address' || popupKey === 'sample') {
                otherOverlay?.classList.remove('is-hidden');

                if (parent) {
                    const activeRadio = parent.querySelector('input[name*="delivery_type"]:checked');
                    const isPvz = activeRadio && activeRadio.value === 'pvz';
                    targetPopup.classList.toggle('popup--pvz', isPvz);
                }
            }

            targetPopup.style.transform = '';
            targetPopup.style.transition = '';
            targetPopup.classList.remove('is-hidden');
            btn.classList.add('is-open');
            toggleScroll(true);
        });
    });

    document.addEventListener('click', (evt) => {
        const closeButton = evt.target.closest('[data-button="close-popup"]');

        if (closeButton) {
            const currentPopup = closeButton.closest('[data-popup]');
            if (currentPopup && currentPopup.getAttribute('data-popup') === 'edit-address' && document.querySelector('[data-popup="edit-delivery"]:not(.is-hidden)')) {
                resetPopupState(currentPopup);
            } else {
                closeAllPopups();
                otherOverlay?.classList.add('is-hidden');
            }
            return;
        }

        const isClickInsidePopup = evt.target.closest('[data-popup]');
        const isClickOnOpenButton = evt.target.closest('[data-button-open]') || evt.target.closest('[data-button="open"]');

        if (!isClickInsidePopup && !isClickOnOpenButton) {
            closeAllPopups();
            otherOverlay?.classList.add('is-hidden');
            return;
        }

        if (isClickInsidePopup && evt.target === isClickInsidePopup) {
            const popupKey = isClickInsidePopup.getAttribute('data-popup');
            if (popupKey === 'edit-address' && document.querySelector('[data-popup="edit-delivery"]:not(.is-hidden)')) {
                resetPopupState(isClickInsidePopup);
                return;
            }
            if (popupKey === 'other' || popupKey !== 'favorite-popup') {
                closeAllPopups();
                otherOverlay?.classList.add('is-hidden');
            }
        }
    });

    document.addEventListener('keydown', (evt) => {
        if (evt.key === 'Escape') {
            const editAddressPopup = document.querySelector('[data-popup="edit-address"]');
            if (editAddressPopup && !editAddressPopup.classList.contains('is-hidden') && document.querySelector('[data-popup="edit-delivery"]:not(.is-hidden)')) {
                resetPopupState(editAddressPopup);
            } else {
                closeAllPopups();
            }
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth <= 1024) {
            const favPopup = document.querySelector('[data-popup="favorite-popup"]');
            if (favPopup && !favPopup.classList.contains('is-hidden')) {
                closeAllPopups();
            }
        }
    });

    return { closeAllPopups };
};
