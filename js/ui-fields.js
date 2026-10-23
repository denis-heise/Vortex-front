const initInputWrappers = () => {
	const wrappersInput = document.querySelectorAll('[data-wrapper-input]');

	if (wrappersInput.length < 1) return;

	wrappersInput.forEach((wrapperInput) => {
		const input = wrapperInput.querySelector('input');
		const textarea = wrapperInput.querySelector('textarea');
		const field = input || textarea;

		if (!field) return;

		const checkValue = () => {
			const error = wrapperInput.querySelector('[data-element="error-message"]');
			const isNotEmpty = field.value.trim() !== '';
			field.classList.toggle('is-full', isNotEmpty);
			wrapperInput.classList.toggle('is-full', isNotEmpty);
			wrapperInput.classList.remove('is-error', isNotEmpty);
			if (error) error.remove();
		};

		checkValue();

		field.addEventListener('input', checkValue);

		field.addEventListener('click', () => {
			if (input && input.getAttribute('type') === 'checkbox') {
				const error = wrapperInput.querySelector('[data-element="error-message"]');
				wrapperInput.classList.remove('is-error');
				if (error) error.remove();
			}
		});
	});
};

const initSelectBlocks = () => {
    document.addEventListener('click', (evt) => {
        const target = evt.target;

        const button = target.closest('[data-element="select-button"]');
        if (button) {
            evt.preventDefault();
            const block = button.closest('[data-block="select"]');
            const wrapper = block?.closest('[data-select-wrapper]');
            if (!block) return;

            const isOpen = block.classList.contains('is-open');
            const scrollable = block.closest('[data-scrollable-block]');

            if (scrollable) {
                scrollable.style.height = '';
            }

            const allSelectBlocks = document.querySelectorAll('[data-block="select"]');
            allSelectBlocks.forEach((otherBlock) => {
                if (otherBlock !== block) {
                    const otherWrapper = otherBlock.closest('[data-select-wrapper]');
                    otherBlock.classList.remove('is-open');
                    otherWrapper?.classList.remove('is-open');
                    otherBlock.querySelector('[data-element="select-button"]')?.setAttribute('aria-expanded', 'false');
                }
            });

            const nextState = !isOpen;
            block.classList.toggle('is-open', nextState);
            wrapper?.classList.toggle('is-open', nextState);
            button.setAttribute('aria-expanded', nextState ? 'true' : 'false');

            if (nextState && scrollable) {
                const list = block.querySelector('[data-block="select-list"]');
                if (list) {
                    const listBottom = list.getBoundingClientRect().bottom;
                    let screenHeight = window.innerHeight;

                    const popup = block.closest('[data-popup]');
                    if (popup && popup.classList.contains('is-full')) {
                        const footer = popup.querySelector('[data-block="popup-footer"]') || popup.querySelector('.popup__footer');
                        if (footer) {
                            screenHeight = footer.getBoundingClientRect().top;
                        }
                    }

                    if (listBottom > screenHeight) {
                        const overflowHeight = listBottom - screenHeight;
                        const currentHeight = scrollable.offsetHeight;

                        scrollable.style.height = `${currentHeight - overflowHeight - 16}px`;
                    }
                }
            }
            return;
        }

        const option = target.closest('[data-select-item]');
        if (option) {
            evt.preventDefault();
            const block = option.closest('[data-block="select"]');
            const button = block?.querySelector('[data-element="select-button"]');
            const selectTitle = block?.querySelector('[data-element="select-title"]');
            const wrapper = block?.closest('[data-select-wrapper]');
            const list = option.closest('[data-block="select-list"]');

            if (!block || !list || !button || !selectTitle) return;

            const options = list.querySelectorAll('[data-select-item]');
            options.forEach((opt) => {
                opt.classList.remove('is-selected');
                opt.setAttribute('aria-selected', 'false');
            });

            option.setAttribute('aria-selected', 'true');
            option.classList.add('is-selected');
            selectTitle.textContent = option.textContent.trim();

			const samplePopup = block.closest('[data-popup="sample"]');
            if (samplePopup) {
                const selectButton = samplePopup.querySelector('[data-button-type="select"]');
                if (selectButton) {
                    selectButton.removeAttribute('disabled');
                }
            }

            const scrollable = block.closest('[data-scrollable-block]');
            if (scrollable) {
                scrollable.style.height = '';
            }

            block.classList.remove('is-open');
            wrapper?.classList.remove('is-open');
            button.setAttribute('aria-expanded', 'false');

            if (typeof checkFormState === 'function') {
                checkFormState();
            }
            return;
        }

        const allSelectBlocks = document.querySelectorAll('[data-block="select"]');
        allSelectBlocks.forEach((block) => {
            if (!block.contains(target) && block.classList.contains('is-open')) {
                const wrapper = block.closest('[data-select-wrapper]');
                const btn = block.querySelector('[data-element="select-button"]');

                const scrollable = block.closest('[data-scrollable-block]');
                if (scrollable) {
                    scrollable.style.height = '';
                }

                block.classList.remove('is-open');
                wrapper?.classList.remove('is-open');
                btn?.setAttribute('aria-expanded', 'false');
            }
        });
    });
};

const initSearchForm = (popupManager) => {
    const searchBlock = document.querySelector('.search-block');
    if (!searchBlock) return;

    const openBtn = searchBlock.querySelector('[data-button="open-search"]');
    const closeBtn = searchBlock.querySelector('[data-button="close-search"]');
    const popup = searchBlock.querySelector('[data-popup="search"]');
    const input = searchBlock.querySelector('[data-input-search]');

    const openSearch = () => {
        popup?.classList.remove('is-hidden');
        setTimeout(() => input?.focus(), 50);
    };

    const closeAndClearSearch = () => {
        popup?.classList.add('is-hidden');
        if (input) input.value = '';
    };

    const toggleSearch = () => {
        if (popup?.classList.contains('is-hidden')) {
            openSearch();
        } else {
            closeAndClearSearch();
        }
    };

    openBtn?.addEventListener('click', (evt) => {
        evt.stopPropagation();
		if (popupManager && typeof popupManager.closeAllPopups === 'function') {
			popupManager.closeAllPopups();
		}

        const cityWrapper = document.querySelector('[data-select-wrapper="city"]');
        if (cityWrapper) {
            cityWrapper.classList.remove('is-open');

            const cityList = cityWrapper.querySelector('[data-block="select"]');
            if (cityList) {
                cityList.classList.remove('is-open');
            }
        }

		toggleSearch();
    });

    closeBtn?.addEventListener('click', (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        closeAndClearSearch();
    });

    document.addEventListener('click', (evt) => {
        const isClickInside = searchBlock.contains(evt.target);
        if (!isClickInside) {
            closeAndClearSearch();
        }
    });

    document.addEventListener('keydown', (evt) => {
        if (evt.key === 'Escape') {
            closeAndClearSearch();
        }
    });
};

const initMultipleFileInputs = (maxFiles = 5) => {
	const inputs = document.querySelectorAll('[data-input-file]');

	inputs.forEach((input) => {
		const wrapper = input.closest('[data-wrapper-input-file]');
		if (!wrapper) return;

		const label = wrapper.querySelector('label');
		const templateInfo = wrapper.querySelector('[data-file-info]');
		let dt = new DataTransfer();

		const renderFiles = () => {
			wrapper.querySelectorAll('.wrapper-input-file__file-info:not(.is-hidden)').forEach((item) => {
				item.remove();
			});

			Array.from(dt.files).forEach((file, index) => {
				const fileRow = templateInfo.cloneNode(true);
				fileRow.classList.remove('is-hidden');

				const nameSpan = fileRow.querySelector('[data-file-name]');
				const removeBtn = fileRow.querySelector('button');
				if (removeBtn) {
					removeBtn.setAttribute('data-button', 'remove-file');
					removeBtn.setAttribute('data-index', index);
				}

				nameSpan.textContent = file.name;
				wrapper.appendChild(fileRow);
			});

			if (dt.files.length >= maxFiles) {
				label.classList.add('is-hidden');
			} else {
				label.classList.remove('is-hidden');
			}

			input.files = dt.files;
		};

		input.addEventListener('change', () => {
			if (input.files.length === 0) return;

			Array.from(input.files).forEach((file) => {
				if (dt.files.length < maxFiles) {
					dt.items.add(file);
				}
			});

			renderFiles();
		});

		wrapper.addEventListener('click', (evt) => {
			const btn = evt.target.closest('[data-button="remove-file"]');
			if (!btn || btn.closest('.is-hidden')) return;

			evt.stopPropagation();

			const indexToRemove = parseInt(btn.getAttribute('data-index'), 10);
			const newDt = new DataTransfer();

			Array.from(dt.files).forEach((file, index) => {
				if (index !== indexToRemove) {
					newDt.items.add(file);
				}
			});

			dt = newDt;
			renderFiles();
		});

	});
};

const initCalendarFields = () => {
    const dateInputs = document.querySelectorAll('[data-calendar]');
    if (!dateInputs.length) return;

    dateInputs.forEach((dateInput) => {
        const wrapper = dateInput.closest('[data-wrapper-input]');
        const isRangeMode = dateInput.getAttribute('data-calendar') === 'range';

        const formatSingleDate = (digits) => {
            let res = digits.substring(0, 2);
            if (digits.length > 2) {
                res += '.' + digits.substring(2, 4);
                if (digits.length > 4) {
                    res += '.' + digits.substring(4, 8);
                }
            }
            return res;
        };

        const toggleFullState = (value) => {
            if (!wrapper) return;
            const expectedLength = isRangeMode ? 23 : 10;
            const isFull = value.length === expectedLength;
            wrapper.classList.toggle('is-full', isFull);
            dateInput.classList.toggle('is-full', isFull);
        };

        dateInput.addEventListener('input', (evt) => {
            let digits = evt.target.value.replace(/\D/g, '');
            let formattedValue = '';

            if (isRangeMode) {
                const date1 = digits.substring(0, 8);
                const date2 = digits.substring(8, 16);

                if (date1.length > 0) {
                    formattedValue = formatSingleDate(date1);
                    if (date1.length === 8 && date2.length > 0) {
                        formattedValue += ' - ' + formatSingleDate(date2);
                    } else if (date1.length === 8 && evt.inputType !== 'deleteContentBackward') {
                        formattedValue += ' - ';
                    }
                }
            } else {
                if (evt.inputType === 'deleteContentBackward' && (digits.length === 2 || digits.length === 4)) {
                    digits = digits.substring(0, digits.length - 1);
                }
                if (digits.length > 0) {
                    formattedValue = formatSingleDate(digits);
                }
            }

            evt.target.value = formattedValue;
            toggleFullState(formattedValue);
        });

        if (typeof AirDatepicker !== 'undefined') {
            new AirDatepicker(dateInput, {
                range: isRangeMode,
                multipleDatesSeparator: ' - ',
                autoClose: !isRangeMode,
                minDate: new Date(),
                onSelect({formattedDate}) {
                    let value = '';
                    if (Array.isArray(formattedDate)) {
                        value = formattedDate.length === 2 ? formattedDate.join(' - ') : formattedDate || '';
                    } else {
                        value = formattedDate || '';
                    }
                    toggleFullState(value);
                }
            });
        }
    });
};

const initUniversalPasswordMasking = () => {
    const passwordSelector = '[data-input="password"]';

    const reqLetters = document.querySelector('[data-element="requirement-letters"]');
    const reqDigits = document.querySelector('[data-element="requirement-digits"]');
    const reqSpecials = document.querySelector('[data-element="requirement-specials"]');

    const validateNewPasswordRequirements = (value) => {
        const hasUppercase = /[A-ZА-ЯЁ]/.test(value);
        const hasLowercase = /[a-zа-яё]/.test(value);
        const hasDigits = /[0-9]/.test(value);
        const hasSpecials = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(value);

        if (reqLetters) reqLetters.checked = hasUppercase && hasLowercase;
        if (reqDigits) reqDigits.checked = hasDigits;
        if (reqSpecials) reqSpecials.checked = hasSpecials;
    };

    const verifyPasswordsMatch = () => {
        const newPasswordInput = document.querySelector('[data-element="new-password"]');
        const confirmPasswordInput = document.querySelector('[data-element="confirm-password"]');
        if (!newPasswordInput || !confirmPasswordInput) return;

        const newPass = newPasswordInput.dataset.value || '';
        const confirmPass = confirmPasswordInput.dataset.value || '';
        const wrapper = confirmPasswordInput.closest('[data-wrapper-input]');
        if (!wrapper) return;

        if (confirmPass.length > 0) {
            if (newPass === confirmPass) {
                wrapper.classList.remove('has-error');
                wrapper.classList.add('is-valid');
            } else {
                wrapper.classList.remove('is-valid');
                wrapper.classList.add('has-error');
            }
        } else {
            wrapper.classList.remove('is-valid', 'has-error');
        }
    };

    document.addEventListener('click', (evt) => {
		const btn = evt.target.closest('[data-button="toggle-password-visibility"]');
		if (!btn) return;

		const wrapper = btn.closest('[data-wrapper-input]');
		if (!wrapper) return;

		const input = wrapper.querySelector(passwordSelector);
		if (!input) return;

		if (input.dataset.status !== 'visible') {
			input.dataset.status = 'visible';
			btn.classList.add('is-active');
			input.value = input.dataset.value || '';
		} else {
			input.dataset.status = 'hidden';
			btn.classList.remove('is-active');
			input.value = '*'.repeat((input.dataset.value || '').length);
		}
	});

    document.addEventListener('beforeinput', (evt) => {
        const input = evt.target.closest(passwordSelector);
        if (!input || input.dataset.status === 'visible') return;

        let realValue = input.dataset.value || '';
        const start = input.selectionStart;
        const end = input.selectionEnd;

        if (evt.inputType === 'insertText' || evt.inputType === 'insertFromPaste') {
            const insertedText = evt.data || '';
            realValue = realValue.slice(0, start) + insertedText + realValue.slice(end);
        } else if (evt.inputType === 'deleteContentBackward') {
            if (start === end) {
                realValue = realValue.slice(0, start - 1) + realValue.slice(end);
            } else {
                realValue = realValue.slice(0, start) + realValue.slice(end);
            }
        } else if (evt.inputType === 'deleteContentForward') {
            if (start === end) {
                realValue = realValue.slice(0, start) + realValue.slice(end + 1);
            } else {
                realValue = realValue.slice(0, start) + realValue.slice(end);
            }
        }

        input.dataset.value = realValue;

        setTimeout(() => {
            input.value = '*'.repeat(realValue.length);
            const newCursorPos = start + (evt.data ? evt.data.length : (evt.inputType === 'deleteContentBackward' && start === end ? -1 : 0));
            input.setSelectionRange(newCursorPos, newCursorPos);

            if (input.matches('[data-element="new-password"]')) {
                validateNewPasswordRequirements(realValue);
                verifyPasswordsMatch();
            }
            if (input.matches('[data-element="confirm-password"]')) {
                verifyPasswordsMatch();
            }
        }, 0);
    });

    document.addEventListener('input', (evt) => {
        const input = evt.target.closest(passwordSelector);
        if (!input || input.dataset.status !== 'visible') return;

        input.dataset.value = input.value;

        if (input.matches('[data-element="new-password"]')) {
            validateNewPasswordRequirements(input.value);
            verifyPasswordsMatch();
        }
        if (input.matches('[data-element="confirm-password"]')) {
            verifyPasswordsMatch();
        }
    });
};

const initPasswordRequirementsValidator = () => {
    const passwordInput = document.querySelector('[data-element="new-password"]');
    if (!passwordInput) return;

    const reqLetters = document.querySelector('[data-element="requirement-letters"]');
    const reqDigits = document.querySelector('[data-element="requirement-digits"]');
    const reqSpecials = document.querySelector('[data-element="requirement-specials"]');

    const validatePassword = () => {
        const value = passwordInput.dataset.value || '';

        const hasUppercase = /[A-ZА-ЯЁ]/.test(value);
        const hasLowercase = /[a-zа-яё]/.test(value);
        const hasDigits = /[0-9]/.test(value);
        const hasSpecials = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(value);

        if (reqLetters) {
            reqLetters.checked = hasUppercase && hasLowercase;
        }

        if (reqDigits) {
            reqDigits.checked = hasDigits;
        }

        if (reqSpecials) {
            reqSpecials.checked = hasSpecials;
        }
    };

    passwordInput.addEventListener('input', validatePassword);

    document.addEventListener('click', (evt) => {
        const btn = evt.target.closest('[data-button="toggle-password-visibility"]');
        if (btn && btn.closest('[data-wrapper-input]')) {
            validatePassword();
        }
    });
};

const initAddressSyncManager = () => {
    const buttonsTypeData = document.querySelectorAll('[data-element="legal-address"], [data-element="actual-address"]');

    buttonsTypeData.forEach((button) => {
        const form = button.closest('form');
        const parent = button.closest('[data-block="toggle-parent"]');
        if (!form || !parent) return;

        if (!parent.userBackup) {
            parent.userBackup = new Map();
        }

        button.addEventListener('change', () => {
            const allCheckboxesInParent = parent.querySelectorAll('input[type="checkbox"]');
            const targetElements = parent.querySelectorAll('[data-type]');
            let isAnyChecked = false;

            allCheckboxesInParent.forEach((cb) => {
                if (cb.checked) isAnyChecked = true;
            });

            allCheckboxesInParent.forEach((cb) => {
                const wrapperInput = cb.closest('.wrapper-input');
                if (isAnyChecked && !cb.checked) {
                    cb.disabled = true;
                    if (wrapperInput) wrapperInput.classList.add('is-disabled');
                } else {
                    cb.disabled = false;
                    if (wrapperInput) wrapperInput.classList.remove('is-disabled');
                }
            });

            if (!button.checked) {
                targetElements.forEach((targetEl) => {
                    if (parent.userBackup.has(targetEl)) {
                        const oldVal = parent.userBackup.get(targetEl);

                        if (targetEl.tagName === 'INPUT') {
                            targetEl.value = oldVal;
                            const wrapper = targetEl.closest('[data-wrapper-input]');
                            if (wrapper) wrapper.classList.toggle('filled', targetEl.value !== '');
                        } else if (targetEl.tagName === 'SPAN') {
                            targetEl.textContent = oldVal;
                        }
                    }
                });
                return;
            }

            const blockType = form.querySelector(`[data-block="${button.getAttribute('data-element')}"]`);
            if (!blockType) return;

            targetElements.forEach((targetEl) => {
                if (targetEl.tagName === 'INPUT') {
                    parent.userBackup.set(targetEl, targetEl.value);
                } else if (targetEl.tagName === 'SPAN') {
                    parent.userBackup.set(targetEl, targetEl.textContent);
                }
            });

            targetElements.forEach((targetEl) => {
                const dataType = targetEl.getAttribute('data-type');
                if (!dataType) return;

                const sourceEl = blockType.querySelector(`[data-type="${dataType}"]`);
                if (!sourceEl) return;

                if (targetEl.tagName === 'INPUT' && sourceEl.tagName === 'INPUT') {
                    targetEl.value = sourceEl.value;
                    const wrapper = targetEl.closest('[data-wrapper-input]');
                    if (wrapper) wrapper.classList.toggle('filled', targetEl.value !== '');
                } else if (targetEl.tagName === 'SPAN' && sourceEl.tagName === 'SPAN') {
                    targetEl.textContent = sourceEl.textContent;
                    const selectWrapper = targetEl.closest('[data-select-wrapper]');
                    if (selectWrapper) selectWrapper.classList.add('select-wrapper--value');
                }
            });
        });
    });
};

const initNumericInputsTracker = () => {
    document.addEventListener('input', (evt) => {
        const input = evt.target.closest('[data-validate]');
        if (!input) return;

        const type = input.getAttribute('data-validate');
        const maxLength = LIMITS[type];
        if (!maxLength) return;

        if (type === 'kpp') {
            input.value = input.value.replace(/[^0-9A-Z]/g, '').slice(0, maxLength);
        } else {
            input.value = input.value.replace(/\D/g, '').slice(0, maxLength);
        }

        const wrapper = input.closest('[data-wrapper-input]');
        if (!wrapper) return;
		const error = wrapper.querySelector('[data-element="error-message"]');

        if (input.value.length === maxLength) {
            wrapper.classList.remove('is-error');
			if (error) error.remove();
        } else {
            wrapper.classList.add('is-error');
        }
    });
};

const initPopupResetTracker = () => {
    document.addEventListener('click', (evt) => {
        const button = evt.target.closest('[data-button="reset-popup"]');
        if (!button) return;

        const popup = button.closest('[data-popup]');
        if (!popup) return;

        const inputs = popup.querySelectorAll('input, select, textarea');

        inputs.forEach((input) => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else {
                input.value = '';
            }

            const wrapper = input.closest('[data-wrapper-input]');
            if (wrapper) {
                wrapper.classList.remove('is-error');
            }
        });
    });
};
