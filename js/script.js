const SCROLL_THRESHOLD = 250;
const header = document.querySelector('.header');
const buttonsOpen = document.querySelectorAll('[data-button="open"]');
const buttonsOpenParent = document.querySelectorAll('[data-button="open-parent"]');
const buttonsToggle = document.querySelectorAll('[data-button="toggle"]');
const otherOverlay = document.querySelector('[data-popup="other"]');

const initCurrentYear = () => {
	const yearElement = document.querySelector('[data-element="current-year"]');
	if (yearElement) {
		yearElement.textContent = new Date().getFullYear();
	}
};

const initScrollToTopButton = () => {
	const buttonUp = document.querySelector('[data-button="up"]');

    if (!buttonUp) return;
    const handleScroll = () => {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        buttonUp.classList.toggle('hidden', scrollY <= SCROLL_THRESHOLD);
    };
    window.addEventListener('scroll', handleScroll);
    buttonUp.addEventListener('click', () => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    });
};

const initScrollableElements = () => {
    const scrollableBlocks = document.querySelectorAll('[data-scrollable-block]');

    if (scrollableBlocks.length < 1) return;

    scrollableBlocks.forEach((scrollable) => {
        if (scrollable.hasAttribute('data-table-block') && window.innerWidth >= 1450) {
            return;
        }

        if (typeof SimpleBar !== 'undefined') {
            scrollable.simplebarInstance = new SimpleBar(scrollable, {
                autoHide: true,
                scrollbarMinSize: 10,
                scrollbarMaxSize: 100,
            });
        }
    });
};

const toggleBlockClass = (buttons, className, eventType = 'click') => {
    buttons?.forEach((button) => {
        button.addEventListener(eventType, () => {
            if (button.hasAttribute('disabled') || button.disabled) {
                return;
            }

            const parent = button.closest('[data-block]');
            const value = parent?.dataset.block;

            parent.classList.toggle(className);

            if (value === 'filter-item') {
                setTimeout(() => {
                    const popupContent = button.closest('[data-scrollable-block]');
                    if (popupContent && popupContent.simplebarInstance) {
                        const sb = popupContent.simplebarInstance;

                        const contentEl = sb.getContentElement();
                        const scrollEl = sb.getScrollElement();

                        if (contentEl) contentEl.style.height = 'auto';
                        if (scrollEl) scrollEl.style.height = 'auto';

                        sb.recalculate();
                    }
                }, 350);
            }
        });
    });
};

document.addEventListener('DOMContentLoaded', () => {
	const popupManager = initPopupManager();
	const recipientFallback = `
        <div class="clone-block" data-block="copy-data">
            <div class="wrapper-input" data-wrapper-input="">
                <label class="wrapper-input__label" for="full_name__ID_SUFFIX_">ФИО <span class="u-color-green">*</span></label>
                <input type="text" id="full_name__ID_SUFFIX_" placeholder="Пример: Константинов Константин Константинович" name="full_name" data-required="true" data-validate="full-name">
            </div>
            <div class="wrapper-input" data-wrapper-input="">
                <label class="wrapper-input__label" for="email__ID_SUFFIX_">Email <span class="u-color-green">*</span></label>
                <input type="email" id="email__ID_SUFFIX_" placeholder="example@mail.ru" name="email" data-required="true">
            </div>
            <div class="wrapper-input" data-wrapper-input="">
                <label class="wrapper-input__label" for="phone__ID_SUFFIX_">Телефон <span class="u-color-green">*</span></label>
                <input type="text" id="phone__ID_SUFFIX_" placeholder="+7 (_ _ _) _ _ _ — _ _ — –_ _" name="tel" data-required="true">
            </div>
        </div>
    `;

	if (typeof initSearchForm === 'function') initSearchForm(popupManager);

	initCurrentYear();
	initSidebarNavigation();
	if (typeof initAuthStorageState === 'function') initAuthStorageState();
	initScrollToTopButton();
	if (typeof initInputWrappers === 'function') initInputWrappers();
	initScrollableElements();
	if (typeof initSelectBlocks === 'function') initSelectBlocks();
	if (typeof initQuantityCounters === 'function') initQuantityCounters();
	if (typeof initDeleteElements === 'function') initDeleteElements();
	if (typeof initBasketCalculations === 'function') initBasketCalculations();
	if (typeof initOrdersTableFlexSync === 'function') initOrdersTableFlexSync();
	initTabs();
	if (typeof initBasketRecalculation === 'function') initBasketRecalculation();
    initDuplicateElements();
    if (typeof initCalendarFields === 'function') initCalendarFields();
	initRadioSynchronizer();
	if (typeof initUniversalPasswordMasking === 'function') initUniversalPasswordMasking();
	if (typeof initPasswordRequirementsValidator === 'function') initPasswordRequirementsValidator();
	if (typeof initAddressSyncManager === 'function') initAddressSyncManager();
	if (typeof initPopupScrollableElements === 'function') initPopupScrollableElements();
	if (typeof initNumericInputsTracker === 'function') initNumericInputsTracker();
	if (typeof initPopupResetTracker === 'function') initPopupResetTracker();
	if (typeof initTableHorizontalScroll === 'function') initTableHorizontalScroll();
	if (typeof setTotalPricesInlineWidth === 'function') setTotalPricesInlineWidth();
	if (typeof alignBasketResultWidth === 'function') alignBasketResultWidth();
	if (typeof initPopupTabsToggle === 'function') initPopupTabsToggle();
	if (typeof initDynamicCurrencyRate === 'function') initDynamicCurrencyRate();
	initBackNavigation();
	if (typeof watchProductList === 'function') watchProductList();
	if (typeof initSvgTraffic === 'function') initSvgTraffic();

	initTabsGeneric('[data-block="products-list"]', 'data-tab-products', 'data-list-products');
	initTabsGeneric(null, 'data-tab-card-type');
	initTabsGeneric(null, 'data-button="select"');

	initToggleButtons(buttonsOpen, 'is-open', 'click', popupManager);
	toggleBlockClass(buttonsOpenParent, 'is-open', 'click');
	toggleBlockClass(buttonsToggle, 'is-open', 'change');

    if (typeof alignHeightsInParent === 'function') {
        alignHeightsInParent('[data-element="organization-title"]');
        alignHeightsInParent('[data-element="organization-subtitle"]');
        alignHeightsInParent('[data-element="news-title"]', true);
        alignHeightsInParent('[data-element="news-description"]', true);
    }
	initTableToggle('data-select-table', '[data-table-block]', 'table-block');

	if (typeof initMultipleFileInputs === 'function') initMultipleFileInputs(5);

	initDynamicContainerCloner(
        '[data-button="add-recipient"]',
        '[data-block="parent"]',
        '[data-block="copy-data"]',
        5,
        recipientFallback
    );

	initDynamicListManager(
		'[data-block="products-list"]',
		'data-list-products',
		'[data-element="item"]',
		'[data-element="tabs-count"]',
		'[data-table-products]'
	);

	if (typeof createProductCardController === 'function') createProductCardController();

	if (typeof createBasketController === 'function') {
        createBasketController({
            renderTemplate: (data) => `
                <div class="popup__item-info">
                    <span class="popup__item-name">\${data.name}</span>
                    <span class="popup__item-price" data-element="item-price" data-base-price="\${data.basePrice}">\${data.formattedPrice}</span>
                </div>
                <div class="popup__item-controls">
                    <div class="popup__item-quantity counter">
                        <label class="counter__label" for="\${data.id}">Количество:</label>
                        <div class="counter__controls" data-block="quantity">
                            <button class="counter__btn" type="button" aria-label="Уменьшить количество на 1" data-counter="minus">
                                <svg class="popup__counter-icon" width="7" height="7" aria-hidden="true">
                                    <use href="images/sprite.svg#minus"></use>
                                </svg>
                            </button>
                            <input class="counter__input" type="text" id="\${data.id}" value="\${data.quantity}" data-quantity-input>
                            <button class="counter__btn" type="button" aria-label="Увеличить количество на 1" data-counter="plus">
                                <svg class="popup__counter-icon" width="7" height="7" aria-hidden="true">
                                    <use href="images/sprite.svg#plus"></use>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <button class="popup__delete-btn" type="button" aria-label="Удалить" data-button="delete-item">
                        <svg class="popup__delete-icon" width="12" height="12" aria-hidden="true">
                            <use href="images/sprite.svg#delete"></use>
                        </svg>
                    </button>
                </div>
            `,

            renderSampleTemplate: (data) => `
                <div class="popup__item-info">
                    <span class="popup__item-name">\${data.name}</span>
                    <button class="popup__delete-btn" type="button" aria-label="Удалить" data-button="delete-item">
                        <svg class="popup__delete-icon" width="12" height="12" aria-hidden="true">
                            <use href="images/sprite.svg#delete"></use>
                        </svg>
                    </button>
                </div>
            `
        });
    }
});

window.addEventListener('resize', () => {
	if (typeof initSvgTraffic === 'function') initSvgTraffic();
});
