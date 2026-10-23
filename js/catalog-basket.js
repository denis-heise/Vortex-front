const MAX_VALUE_LENGTH = 3;

const initQuantityCounters = () => {
    const resizeInput = (input) => {
        const charactersCount = input.value.length || input.placeholder.length || 1;
        input.style.width = `${charactersCount * 8}px`;
    };

    document.querySelectorAll('[data-quantity-input]').forEach((input) => {
        resizeInput(input);
    });

    document.addEventListener('click', (evt) => {
        const button = evt.target.closest('[data-counter]');
        if (!button) {
            return;
        }

        const container = button.closest('[data-block="quantity"]');
        const input = container?.querySelector('[data-quantity-input]');
        if (!input) {
            return;
        }

        const counterType = button.dataset.counter;
        const minimumValue = 1;
        const maximumValue = parseInt('9'.repeat(MAX_VALUE_LENGTH)) || 999;
        const stepValue = 1;
        let currentValue = parseInt(input.value) || minimumValue;

        if (counterType === 'plus') {
            if (currentValue < maximumValue) {
                currentValue += stepValue;
            }
        } else if (counterType === 'minus') {
            currentValue = Math.max(minimumValue, currentValue - stepValue);
        }

        if (input.value !== String(currentValue)) {
            input.value = currentValue;
            resizeInput(input);
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });

    document.addEventListener('input', (evt) => {
        const input = evt.target.closest('[data-quantity-input]');
        if (!input) {
            return;
        }

        let cleanedValue = input.value.replace(/\D/g, '');

        if (cleanedValue.length > MAX_VALUE_LENGTH) {
            cleanedValue = cleanedValue.slice(0, MAX_VALUE_LENGTH);
        }

        const numericValue = parseInt(cleanedValue);

        if (isNaN(numericValue)) {
            input.value = '';
        } else {
            input.value = numericValue;
        }

        resizeInput(input);
        input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    document.addEventListener('focusout', (evt) => {
        const input = evt.target.closest('[data-quantity-input]');
        if (!input) {
            return;
        }

        const minimumValue = 1;
        const currentValue = parseInt(input.value);

        if (isNaN(currentValue) || currentValue < minimumValue) {
            input.value = minimumValue;
            resizeInput(input);
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
};

const initDeleteElements = () => {
	document.addEventListener('click', (evt) => {
		const deleteBtn = evt.target.closest('[data-button="delete-item"]');
		if (!deleteBtn) return;

		const item = deleteBtn.closest('[data-element="item"]') || deleteBtn.closest('.popup__item');
		const parentBlock = deleteBtn.closest('[data-block="parent"]');
		const sectionBlock = deleteBtn.closest('[data-block="section"]');
		const favoriteCard = deleteBtn.closest('[data-favorite-card]');
		const popupBasket = deleteBtn.closest('[data-popup="basket"]');
		const basketCard = deleteBtn.closest('[data-basket-card]');

		if (!favoriteCard && !popupBasket && !basketCard) return;

		if (item) {
			const id = item.getAttribute('data-id-product') || deleteBtn.getAttribute('data-id-product');
			if (id) {
				const catalogItem = document.querySelector(`[data-id-product="${id}"]`);
				if (catalogItem) {
					const catalogParent = catalogItem.closest('[data-block="parent"]');
					if (catalogParent) {
						catalogParent.classList.remove('is-added');
						const totalPrice = catalogParent.querySelector('[data-element="item-price"]');
						if (totalPrice) totalPrice.classList.add('is-hidden');
					}
				}
			}
		}

		if (item) {
			item.classList.add('is-removing');

			setTimeout(() => {
				item.remove();
			}, 350);
		}

		if (typeof updateAllTotals === 'function') updateAllTotals();

		if (parentBlock) {
			const remainingItems = parentBlock.querySelectorAll('[data-element="item"]');
			if (remainingItems.length === 0) {
				parentBlock.classList.add('is-hidden');
			}
		}

		if (sectionBlock) {
			const allParents = sectionBlock.querySelectorAll('[data-block="parent"]');
			const hiddenParents = sectionBlock.querySelectorAll('[data-block="parent"].is-hidden');
			const remainingItemsInSection = sectionBlock.querySelectorAll('[data-element="item"]');

			if (allParents.length === hiddenParents.length || remainingItemsInSection.length === 0) {
				sectionBlock.classList.add('is-hidden');
			}
		}

		setTimeout(() => {
			if (parentBlock && typeof updateSectionTotals === 'function') {
				updateSectionTotals(parentBlock);
			}
		}, 350);
	});
};

const updateAllTotals = () => {
    const mainOrderValue = document.querySelector('[data-element="main-value"]');
    const samplesValue = document.querySelector('[data-element="samples-value"]');
    const totalPriceElements = document.querySelectorAll('[data-element="total-price"]');

	let totalMainPrice = 0;
	let totalMainCount = 0;
	let totalSamplesCount = 0;

	document.querySelectorAll('[data-block="section"], [data-block="parent"]').forEach((section) => {
		const isMainOrder = section.closest('[data-block="main-order"]') || section.classList.contains('popup__section--white');
		const isSamples = section.closest('[data-block="samples"]') || !section.classList.contains('popup__section--white');
		const items = section.querySelectorAll('[data-element="item"]:not([data-disabled])');

		const sectionCountBadge = section.querySelector('[data-element="product-count"]') || section.querySelector('[data-element="badge"]');
		if (sectionCountBadge) {
			sectionCountBadge.textContent = items.length;

			if (items.length === 0) {
				const parent = sectionCountBadge.parentElement;
				parent.classList.add('count-heading__badge--disabled');
			}
		}

		let tablePrice = 0;
		items.forEach((item) => {
			const priceEl = item.querySelector('[data-element="item-price"]');
			if (priceEl && typeof parsePrice === 'function') {
				tablePrice += parsePrice(priceEl.textContent);
			}
		});

		const blockPriceElements = section.querySelectorAll('[data-element="block-price"]');
		if (typeof formatCurrency === 'function') {
            blockPriceElements?.forEach(price => price.textContent = formatCurrency(tablePrice));
        }

		if (isMainOrder) {
			totalMainCount += items.length;
			totalMainPrice += tablePrice;
		}
		if (isSamples) {
			totalSamplesCount += items.length;
		}
	});

	if (mainOrderValue && typeof getPositionsWord === 'function') mainOrderValue.textContent = `${totalMainCount} ${getPositionsWord(totalMainCount)}`;
	if (samplesValue && typeof getPositionsWord === 'function') samplesValue.textContent = `${totalSamplesCount} ${getPositionsWord(totalSamplesCount)}`;
	if (typeof formatCurrency === 'function') {
        totalPriceElements?.forEach(price => price.textContent = formatCurrency(totalMainPrice));
    }
};

const updateSectionTotals = (section) => {
    const badge = section.querySelector('[data-element="badge"]');
    if (!badge) {
        return;
    }

    const items = section.querySelectorAll('[data-element="item"]');
    let totalQuantity = 0;

    items.forEach((item) => {
        const input = item.querySelector('[data-quantity-input]');
        totalQuantity += input ? (parseInt(input.value) || 0) : 1;
    });

    badge.textContent = totalQuantity;
};

const initBasketCalculations = () => {
    const basket = document.querySelector('[data-popup="basket"]');
    if (!basket) {
        return;
    }

    basket.addEventListener('change', (evt) => {
        if (evt.target.hasAttribute('data-quantity-input')) {
            const section = evt.target.closest('[data-block="parent"]');
            if (section && typeof updateSectionTotals === 'function') {
                updateSectionTotals(section);
            }
        }
    });

    basket.querySelectorAll('[data-block="parent"]').forEach((section) => {
        if (typeof updateSectionTotals === 'function') updateSectionTotals(section);
    });
};

const initBasketRecalculation = () => {
	const setupBasePrices = () => {
		document.querySelectorAll('[data-element="item"]').forEach((item) => {
			const priceEl = item.querySelector('[data-element="item-price"]');
			const input = item.querySelector('[data-quantity-input]');

			if (priceEl && input && !priceEl.hasAttribute('data-base-price') && typeof parsePrice === 'function') {
				const currentPrice = parsePrice(priceEl.textContent);
				const currentCount = parseInt(input.value, 10) || 1;
				const unitPrice = currentCount > 0 ? currentPrice / currentCount : currentPrice;

				priceEl.setAttribute('data-base-price', String(unitPrice));
			}
		});
	};

	const handleRowRecalculation = (input) => {
		const item = input.closest('[data-element="item"]');
		if (!item) return;

		const priceEl = item.querySelector('[data-element="item-price"]');

		if (priceEl && priceEl.hasAttribute('data-base-price') && typeof formatCurrency === 'function') {
			const basePrice = parseFloat(priceEl.getAttribute('data-base-price')) || 0;
			const count = parseInt(input.value, 10) || 0;

			priceEl.textContent = formatCurrency(basePrice * count);
		}
		if (typeof updateAllTotals === 'function') updateAllTotals();
	};

	document.addEventListener('change', (evt) => {
		if (evt.target.hasAttribute('data-quantity-input')) {
			handleRowRecalculation(evt.target);
		}
	});

	document.addEventListener('input', (evt) => {
		if (evt.target.hasAttribute('data-quantity-input')) {
			handleRowRecalculation(evt.target);
		}
	});

	setupBasePrices();
	if (typeof updateAllTotals === 'function') updateAllTotals();
};

const watchProductList = (parentSelector = '[data-table-products]', childSelector = '[data-element="item"]') => {
	const containers = document.querySelectorAll(parentSelector);

	containers.forEach((container) => {
		const check = () => {
			const hasItems = container.querySelectorAll(childSelector);
			container.classList.toggle('is-hidden', hasItems.length === 0);
		};

		check();

		const observer = new MutationObserver(() => check());
		observer.observe(container, { childList: true, subtree: true });
	});
};

const createProductCardController = (config) => {
	const settings = {
		catalogItemSelector: '[data-element="item"]',
		triggerSelector: '[data-button="add-basket"]',
		sampleTriggerSelector: '[data-button="add-sample"]',
		deleteTriggerSelector: '[data-button="delete-basket-item"]',
		quantitySelector: '[data-quantity-input]',
		priceSelector: '[data-element="item-price"]',
		baseUnitPriceSelector: '[data-element="base-unit-price"]',
		blockPriceSelector: '[data-element="block-price"]',
		basePriceAttr: 'data-base-price',
		idAttr: 'data-id-product',
		titleSelector: '[data-element="title-product"]',
		...config
	};

	const localFormatCurrency = (num) => {
		if (num === 0 || isNaN(num)) return '—';
		return '$' + num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$& ').replace('.', ',');
	};

	const updateInputWidth = (input) => {
		if (!input) return;
		const actualValue = input.value || input.getAttribute('value') || "1";
		input.style.width = `${actualValue.length * 8}px`;
	};

	const resetCardState = (productCard) => {
		if (!productCard) return;
		productCard.classList.remove('is-added');

		const blockPrice = productCard.querySelector(settings.blockPriceSelector);
		const targetPriceEl = productCard.querySelector(settings.priceSelector);
		if (blockPrice) blockPrice.classList.add('is-hidden');
		if (targetPriceEl) targetPriceEl.classList.add('is-hidden');

		const quantityInput = productCard.querySelector(settings.quantitySelector);
		if (quantityInput) {
			quantityInput.value = "1";
			updateInputWidth(quantityInput);
		}
	};

	const calculateCardPrice = (productCard) => {
		const sourcePriceEl = productCard.querySelector(settings.baseUnitPriceSelector) || productCard.querySelector(`[${settings.basePriceAttr}]`);
		if (!sourcePriceEl) return;

		let basePrice = parseFloat(sourcePriceEl.getAttribute(settings.basePriceAttr));
		if (isNaN(basePrice) || basePrice === 0) {
			const cleanPriceText = sourcePriceEl.textContent.replace(/[^\d.,]/g, '').replace(',', '.');
			basePrice = parseFloat(cleanPriceText) || 0;
		}

		const quantityInput = productCard.querySelector(settings.quantitySelector);
		const quantity = quantityInput ? (parseInt(quantityInput.value, 10) || 1) : 1;

		const blockPrice = productCard.querySelector(settings.blockPriceSelector);
		const targetPriceEl = productCard.querySelector(settings.priceSelector);

		if (targetPriceEl) {
			targetPriceEl.classList.remove('is-hidden');
			targetPriceEl.textContent = localFormatCurrency(basePrice * quantity);
		}
		if (blockPrice) {
			blockPrice.classList.remove('is-hidden');
		}
	};

	document.addEventListener('click', (evt) => {
		const addBtn = evt.target.closest(settings.triggerSelector);
		const sampleBtn = evt.target.closest(settings.sampleTriggerSelector);
		const deleteBtn = evt.target.closest(settings.deleteTriggerSelector);

		if (deleteBtn) {
			const productCard = deleteBtn.closest(settings.catalogItemSelector);
			if (!productCard) return;

			resetCardState(productCard);

			const productId = deleteBtn.getAttribute(settings.idAttr) || productCard.getAttribute(settings.idAttr);
			document.dispatchEvent(new CustomEvent('basket:remove-product', {
				bubbles: true,
				detail: { id: productId }
			}));
			return;
		}

		if (!addBtn && !sampleBtn) return;

		const currentBtn = addBtn || sampleBtn;
		const isSampleType = !!sampleBtn;

		const productCard = currentBtn.closest(settings.catalogItemSelector);
		if (!productCard) return;

		const titleEl = productCard.querySelector(settings.titleSelector);
		if (!titleEl) return;

		const quantityInput = productCard.querySelector(settings.quantitySelector);
		const quantity = quantityInput ? (parseInt(quantityInput.value, 10) || 1) : 1;
		const productId = currentBtn.getAttribute(settings.idAttr) || productCard.getAttribute(settings.idAttr);

		if (!isSampleType) {
			productCard.classList.add('is-added');
			calculateCardPrice(productCard);
		}

		document.dispatchEvent(new CustomEvent('basket:add-product', {
			bubbles: true,
			detail: {
				id: productId,
				name: titleEl.textContent.trim(),
				quantity: quantity,
				isSample: isSampleType,
				productCard: productCard
			}
		}));
	});

	document.addEventListener('basket:product-removed', (evt) => {
		const { id } = evt.detail;
		if (!id) return;

		const productCards = document.querySelectorAll(settings.catalogItemSelector);
		productCards.forEach((card) => {
			const cardId = card.getAttribute(settings.idAttr);
			const btnAddId = card.querySelector(settings.triggerSelector)?.getAttribute(settings.idAttr);
			const btnDelId = card.querySelector(settings.deleteTriggerSelector)?.getAttribute(settings.idAttr);

			if (cardId === id || btnAddId === id || btnDelId === id) {
				resetCardState(card);
			}
		});
	});

	document.addEventListener('input', (evt) => {
		if (evt.target.hasAttribute('data-quantity-input')) {
			updateInputWidth(evt.target);
			const productCard = evt.target.closest(settings.catalogItemSelector);
			if (productCard && productCard.classList.contains('is-added')) {
				calculateCardPrice(productCard);
			}
		}
	});

	document.querySelectorAll(settings.quantitySelector).forEach(updateInputWidth);
};

const createBasketController = (config) => {
	const settings = {
		basketSelector: '[data-popup="basket"]',
		quantitySelector: '[data-quantity-input]',
		priceSelector: '[data-element="item-price"]',
		baseUnitPriceSelector: '[data-element="base-unit-price"]',
		basePriceAttr: 'data-base-price',
		idAttr: 'data-id-product',
		renderTemplate: (data) => ``,
		renderSampleTemplate: (data) => ``,
		...config
	};

	const localFormatCurrency = (num) => {
		if (num === 0 || isNaN(num)) return '—';
		return '$' + num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$& ').replace('.', ',');
	};

	const updateInputWidth = (input) => {
		if (!input) return;
		const actualValue = input.value || input.getAttribute('value') || "1";
		input.style.width = `${actualValue.length * 8}px`;
	};

	document.addEventListener('click', (evt) => {
		const basketDeleteBtn = evt.target.closest('[data-button="delete-basket-item"]');
		if (!basketDeleteBtn) return;

		const basket = basketDeleteBtn.closest(settings.basketSelector);
		if (!basket) return;

		const item = basketDeleteBtn.closest('[data-element="item"]') || basketDeleteBtn.closest('.popup__item');
		if (!item) return;

		const id = item.getAttribute(settings.idAttr) || basketDeleteBtn.getAttribute(settings.idAttr);
		if (!id) return;

		item.remove();
		basket.dispatchEvent(new Event('change', { bubbles: true }));

		document.dispatchEvent(new CustomEvent('basket:product-removed', {
			bubbles: true,
			detail: { id: id }
		}));
	});

	document.addEventListener('basket:remove-product', (evt) => {
		const { id } = evt.detail;
		const basket = document.querySelector(settings.basketSelector);
		if (!basket || !id) return;

		const existingItem = basket.querySelector(`[${settings.idAttr}="${id}"]`);
		if (existingItem) {
			existingItem.remove();
			basket.dispatchEvent(new Event('change', { bubbles: true }));
		}
	});

	document.addEventListener('basket:add-product', (evt) => {
		const { id, name, quantity, isSample, productCard } = evt.detail;

		const basket = document.querySelector(settings.basketSelector);
		if (!basket) return;

		let targetList = null;
		const sections = basket.querySelectorAll('[data-block="parent"]');

		sections.forEach((section) => {
			const title = section.querySelector('.popup__section-title');
			if (title) {
				const titleText = title.textContent.trim();
				if (isSample && titleText === 'Образцы') {
					targetList = section.querySelector('.popup__list');
				} else if (!isSample && titleText === 'Основной заказ') {
					targetList = section.querySelector('.popup__list');
				}
			}
		});

		if (!targetList) return;

		let existingItem = null;
		if (id) {
			existingItem = targetList.querySelector(`[${settings.idAttr}="${id}"]`);
		}

		const sourcePriceEl = productCard.querySelector(settings.baseUnitPriceSelector) || productCard.querySelector(`[${settings.basePriceAttr}]`);
		let basePrice = sourcePriceEl ? parseFloat(sourcePriceEl.getAttribute(settings.basePriceAttr)) : 0;
		if ((isNaN(basePrice) || basePrice === 0) && sourcePriceEl) {
			const cleanPriceText = sourcePriceEl.textContent.replace(/[^\d.,]/g, '').replace(',', '.');
			basePrice = parseFloat(cleanPriceText) || 0;
		}

		if (existingItem && !isSample) {
			const basketInput = existingItem.querySelector(settings.quantitySelector);
			if (basketInput) {
				const currentQty = parseInt(basketInput.value, 10) || 0;
				const newQty = currentQty + quantity;

				basketInput.value = newQty;

				const priceElInBasket = existingItem.querySelector(settings.priceSelector);
				if (priceElInBasket) {
					priceElInBasket.textContent = localFormatCurrency(basePrice * newQty);
					if (!priceElInBasket.hasAttribute(settings.basePriceAttr)) {
						priceElInBasket.setAttribute(settings.basePriceAttr, String(basePrice));
					}
				}

				updateInputWidth(basketInput);
				basketInput.dispatchEvent(new Event('change', { bubbles: true }));
			}
		} else if (existingItem && isSample) {
			return;
		} else {
			const uniqueInputId = `quantity-item-${Date.now()}`;
			const totalPrice = basePrice * quantity;
			const formattedPrice = localFormatCurrency(totalPrice);

			const newItem = document.createElement('li');
			newItem.classList.add('popup__item');
			newItem.setAttribute('data-element', 'item');

			if (id) {
				newItem.setAttribute(settings.idAttr, id);
			}

			if (isSample) {
				newItem.innerHTML = settings.renderSampleTemplate({
					ipProduct: id,
					name: name
				});
			} else {
				newItem.innerHTML = settings.renderTemplate({
					id: uniqueInputId,
					ipProduct: id,
					name: name,
					basePrice: basePrice,
					quantity: quantity,
					formattedPrice: formattedPrice
				});
			}

			targetList.appendChild(newItem);

			if (!isSample) {
				const newInput = newItem.querySelector(settings.quantitySelector);
				updateInputWidth(newInput);

				const priceElNew = newItem.querySelector(settings.priceSelector);
				if (priceElNew && !priceElNew.hasAttribute(settings.basePriceAttr)) {
					priceElNew.setAttribute(settings.basePriceAttr, String(basePrice));
				}

				if (newInput) newInput.dispatchEvent(new Event('change', { bubbles: true }));
			} else {
				targetList.dispatchEvent(new Event('change', { bubbles: true }));
			}
		}
	});
};

const initDynamicListManager = (wrapperSelector, listAttr, itemSelector, counterSelector, cardsContainerSelector = '') => {
    const wrappers = document.querySelectorAll(wrapperSelector);
    if (!wrappers.length) return;

    wrappers.forEach((wrapper) => {
        wrapper.addEventListener('change', (evt) => {
            const item = evt.target.closest(itemSelector);
			const isFavoriteCard = item ? item.closest('[data-favorite-card]') : null;

            if (!item || !isFavoriteCard) return;

            const listBlock = evt.target.closest(`[${listAttr}]`);

            if (!listBlock) return;

            const listId = listBlock.getAttribute(listAttr);
            const tabAttrName = listAttr.replace('data-list-', 'data-tab-');
            const parentBlock = wrapper.closest('[data-block^="main-"]') || wrapper.closest('[data-block]') || wrapper;

            const activeTab = listId
                ? parentBlock.querySelector(`[${tabAttrName}="${listId}"]`)
                : parentBlock.querySelector('.tabs [role="tab"].is-active, .is-active');

            if (activeTab) {
                const countElement = activeTab.querySelector(counterSelector);
                if (countElement) {
                    const currentCount = parseInt(countElement.textContent, 10) || 0;
                    if (currentCount > 0) {
                        countElement.textContent = currentCount - 1;
                    }
                }
            }

            item.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
            item.style.opacity = '0';
            item.style.transform = 'scale(0.95)';

            setTimeout(() => {
                const cardsContainer = cardsContainerSelector ? item.closest(cardsContainerSelector) : item.parentElement;

                item.remove();

                if (cardsContainer && !cardsContainer.querySelectorAll(itemSelector).length) {
                    cardsContainer.classList.add('is-hidden');
                }
            }, 250);
        });
    });
};
