const initPickupMap = () => {
    const mapContainer = document.querySelector('[data-block="map-address"]');
    if (!mapContainer) return;

    const popupContainer = mapContainer.closest('[data-popup]');

    const getInputAddresses = () => {
        if (!popupContainer) return [];
        return Array.from(popupContainer.querySelectorAll('[data-element="input-address-pvz"], [data-element="input-address-courier"]'));
    };

    const updatePrice = (popup) => {
        if (!popup) return;
        const priceElement = popup.querySelector('[data-element="price-address"]');
        if (!priceElement) return;

        if (popup.classList.contains('popup--pvz')) {
            priceElement.textContent = '387,00 ₽';
        } else {
            priceElement.textContent = '5 187,00 ₽';
        }
    };

    const checkPopupSelection = (popup) => {
        if (!popup) return;

        if (popup.classList.contains('popup--pvz')) {
            const hasSelectedPvz = popup.querySelector('[data-block="pickup-point"].is-selected') !== null;
            if (hasSelectedPvz) {
                popup.classList.add('is-selected');
                updatePrice(popup);
            } else {
                popup.classList.remove('is-selected');
            }
        } else {
            const infoAddressBlock = popup.querySelector('[data-block="info-address"]');
            let isAllFieldsValid = true;

            if (infoAddressBlock) {
                const requiredInputs = infoAddressBlock.querySelectorAll('input[data-required="true"]');
                requiredInputs.forEach((input) => {
                    if (input.value.trim() === '') {
                        isAllFieldsValid = false;
                    }
                });
            } else {
                isAllFieldsValid = false;
            }

            if (isAllFieldsValid) {
                popup.classList.add('is-selected');
                updatePrice(popup);
            } else {
                popup.classList.remove('is-selected');
            }
        }
    };

    const updateAllAddressInputs = (value) => {
        getInputAddresses().forEach((input) => {
            input.value = value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        checkPopupSelection(popupContainer);
    };

    window.mapInstance = null;
    window.mainPlacemarkInstance = null;

    ymaps.ready(() => {
        const defaultCoords = [55.755864, 37.617698];

        window.mapInstance = new ymaps.Map(mapContainer, {
            center: defaultCoords,
            zoom: 12,
            controls: ['zoomControl']
        });

        window.mainPlacemarkInstance = new ymaps.Placemark(defaultCoords, {
            iconCaption: 'Укажите адрес на карте'
        }, {
            preset: 'islands#greenDotIconWithCaption',
            draggable: true
        });

        window.mapInstance.geoObjects.add(window.mainPlacemarkInstance);

        window.mainPlacemarkInstance.events.add('dragend', () => {
            const coords = window.mainPlacemarkInstance.geometry.getCoordinates();

            ymaps.geocode(coords).then((res) => {
                const firstGeoObject = res.geoObjects.get(0);
                if (firstGeoObject) {
                    const currentAddress = firstGeoObject.getAddressLine();

                    updateAllAddressInputs(currentAddress);
                    window.mainPlacemarkInstance.properties.set('iconCaption', currentAddress);
                }
            });
        });

        if (popupContainer) {
            const observer = new MutationObserver(() => {
                if (popupContainer.classList.contains('is-open') || window.getComputedStyle(popupContainer).display !== 'none') {
                    window.mapInstance.container.fitToViewport();
                }
            });
            observer.observe(popupContainer, { attributes: true, attributeFilter: ['class', 'style'] });
        }
    });

    document.addEventListener('click', (evt) => {
        const btn = evt.target.closest('[data-button="show-on-popup-map"]');
        if (!btn) return;

        evt.preventDefault();

        const parent = btn.closest('[data-block="pickup-point"]');
        if (!parent) return;

        const addressEl = parent.querySelector('[data-element="address-name"]');
        if (!addressEl) return;

        const addressText = addressEl.textContent.trim();

        if (typeof ymaps !== 'undefined' && window.mapInstance && window.mainPlacemarkInstance) {
            ymaps.geocode(addressText, { results: 1 }).then((res) => {
                const firstGeoObject = res.geoObjects.get(0);
                if (!firstGeoObject) return;

                const coords = firstGeoObject.geometry.getCoordinates();

                updateAllAddressInputs(addressText);

                window.mainPlacemarkInstance.properties.set('iconCaption', addressText);
                window.mainPlacemarkInstance.geometry.setCoordinates(coords);
                window.mapInstance.setCenter(coords, 15, { duration: 500 });

                const popup = parent.closest('[data-popup]');
                if (!popup) return;

                const allParents = popup.querySelectorAll('[data-block="pickup-point"]');

                allParents.forEach((item) => {
                    if (item !== parent) {
                        item.classList.remove('is-selected');

                        const checkbox = item.querySelector('input[type="checkbox"]');
                        if (checkbox) {
                            checkbox.checked = false;
                        }
                    }
                });

                parent.classList.add('is-selected');
                checkPopupSelection(popup);
            });
        }
    });

    if (popupContainer) {
        popupContainer.addEventListener('input', (evt) => {
            const input = evt.target;
            if (input.matches('[data-block="info-address"] input[data-required="true"]')) {
                checkPopupSelection(popupContainer);
            }
        });
    }

    let searchTimeout;
    const inputs = getInputAddresses();
    inputs.forEach((input) => {
        input.addEventListener('input', (evt) => {
            const addressText = evt.target.value.trim();
            if (addressText.length < 3) return;

            clearTimeout(searchTimeout);

            searchTimeout = setTimeout(() => {
                if (typeof ymaps !== 'undefined' && window.mapInstance && window.mainPlacemarkInstance) {
                    ymaps.geocode(addressText, { results: 1 }).then((res) => {
                        const firstGeoObject = res.geoObjects.get(0);
                        if (!firstGeoObject) return;

                        const coords = firstGeoObject.geometry.getCoordinates();

                        window.mainPlacemarkInstance.properties.set('iconCaption', addressText);
                        window.mainPlacemarkInstance.geometry.setCoordinates(coords);
                        window.mapInstance.setCenter(coords, 15, { duration: 500 });
                    });
                }
            }, 500);
        });
    });
};

document.addEventListener('DOMContentLoaded', initPickupMap);
