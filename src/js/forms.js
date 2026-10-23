const VALIDATION_ERRORS = {
	required: 'Поле обязательно для заполнения',
	invalidEmail: 'Некорректный формат Email',
	invalidName: 'Имя должно содержать не менее 2 символов',
	invalidPhone: 'Введите корректный номер телефона',
	invalidTheme: 'Тема должна содержать не менее 3 символов',
	invalidMessage: 'Сообщение должно содержать не менее 10 символов',
	agreementRequired: 'Необходимо согласие',
	wrongAuth: 'Неверный Email или Пароль!',
	passwordMismatch: 'Пароли не совпадают!',
	userExists: 'Пользователь с таким Email уже зарегистрирован!',
	recaptchaRequired: 'Необходимо подтверждение'
};

const LIMITS = {
	'postal_code': 6,
	'bik': 9,
	'inn': 10,
	'checking_account': 20,
	'kpp': 9
};

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const showInputErrorMock = (wrapperInput, message) => {
	if (!wrapperInput) return;

	wrapperInput.classList.add('is-error');
	let errorEl = wrapperInput.querySelector('[data-element="error-message"]');

	if (!errorEl) {
		wrapperInput.insertAdjacentHTML('beforeend', `<span class="wrapper-input__error-text" data-element="error-message">${message}</span>`);
	} else {
		errorEl.textContent = message;
	}
};

const clearInputErrorMock = (wrapperInput) => {
	if (!wrapperInput) return;

	wrapperInput.classList.remove('is-error');
	const errorEl = wrapperInput.querySelector('[data-element="error-message"]');
	if (errorEl) {
		errorEl.remove();
	}
};

const checkPasswordRequirements = (password) => {
    const value = typeof password === 'string' ? password.trim() : '';
    const hasUppercase = /[A-ZА-ЯЁ]/.test(value);
    const hasLowercase = /[a-zа-яё]/.test(value);
    const hasDigits = /[0-9]/.test(value);
    const hasSpecials = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(value);

    return hasUppercase && hasLowercase && hasDigits && hasSpecials;
};

const initProfileFormValidation = (form) => {
    const submitBtn = form.querySelector('[type="submit"]');
    if (!submitBtn) return;

    const currentPassInput = form.querySelector('[data-element="current-password"]') || form.querySelector('#current_password');
    const newPassInput = form.querySelector('[data-element="new-password"]') || form.querySelector('#new_password');
    const confirmPassInput = form.querySelector('[data-element="confirm-password"]') || form.querySelector('#confirm_password');

    const validateField = (input) => {
        const isMaskedPassword = input.matches('[data-element="current-password"], [data-element="new-password"], [data-element="confirm-password"]');
        const value = isMaskedPassword ? (input.dataset.value || '').trim() : input.value.trim();
        const inputName = input.getAttribute('name');
        const validateAttr = input.getAttribute('data-validate');

        if (input.type === 'checkbox') return input.checked;
        if (!value) return true;

        switch (true) {
            case inputName === 'full_name' || validateAttr === 'full-name' || validateAttr === 'full_name':
                return value.split(/\s+/).filter(word => word.length > 0).length >= 2;
            case inputName === 'first_name':
                return value.length >= 2;
            case inputName === 'tel':
                return value.length >= 18 || value.replace(/\D/g, '').length >= 11;
            case inputName === 'email':
                return validateEmail(value);
            default:
                return true;
        }
    };

    const checkFormState = () => {
        let isFormValid = true;
        let hasAnyInputContent = false;

        const textInputs = form.querySelectorAll('input:not([type="checkbox"]):not([type="hidden"])');
        textInputs.forEach((input) => {
            const isMaskedPassword = input.matches('[data-element="current-password"], [data-element="new-password"], [data-element="confirm-password"]');
            if (isMaskedPassword) return;

            if (input.value.trim().length > 0) {
                hasAnyInputContent = true;
                if (!validateField(input)) {
                    isFormValid = false;
                }
            }
        });

        const currentPassVal = currentPassInput ? (currentPassInput.dataset.value || '').trim() : '';
        const newPassVal = newPassInput ? (newPassInput.dataset.value || '').trim() : '';
        const confirmPassVal = confirmPassInput ? (confirmPassInput.dataset.value || '').trim() : '';

        const isPasswordTouched = currentPassVal.length > 0 || newPassVal.length > 0 || confirmPassVal.length > 0;

        if (isPasswordTouched) {
            hasAnyInputContent = true;

            const isNewStrong = checkPasswordRequirements(newPassVal);

            if (currentPassVal.length < 6 || !isNewStrong || confirmPassVal !== newPassVal || confirmPassVal.length < 6) {
                isFormValid = false;
            }
        }

        submitBtn.disabled = !(isFormValid && hasAnyInputContent);
    };

    form.addEventListener('input', (evt) => {
        const input = evt.target.closest('input');
        if (!input) return;

        setTimeout(() => {
            checkFormState();

            const wrapper = input.closest('[data-wrapper-input]');
            if (wrapper) {
                const isFieldValid = validateField(input);
                if (isFieldValid) wrapper.classList.remove('is-error');
            }
        }, 10);
    });

    form.addEventListener('change', (evt) => {
        if (evt.target.type === 'checkbox') checkFormState();
    });

    submitBtn.disabled = true;
};

const handleFormSubmit = (form) => {
	form.addEventListener('submit', (evt) => {
		evt.preventDefault();

		const wrapper = form.closest('[data-wrapper-form]');
		const finishForm = wrapper ? wrapper.querySelector('[data-finish-form]') : null;
		const requiredInputs = form.querySelectorAll('[data-required="true"]');
		const inputs = form.querySelectorAll('input');
		const popupRoot = form.closest('[data-popup="login"]');
		const currentOverlay = document.querySelector('[data-popup="other"]');

		let isFormValidCount = 0;

		const showInputErrorMock = (wrapperInput, message) => {
			if (!wrapperInput) return;
			wrapperInput.classList.add('is-error');
			let errorEl = wrapperInput.querySelector('[data-element="error-message"]');
			if (!errorEl) {
				wrapperInput.insertAdjacentHTML('beforeend', `<span class="wrapper-input__error-text" data-element="error-message">${message}</span>`);
			} else {
				errorEl.textContent = message;
			}
		};

		const clearInputErrorMock = (wrapperInput) => {
			if (!wrapperInput) return;
			wrapperInput.classList.remove('is-error');
			const errorEl = wrapperInput.querySelector('[data-element="error-message"]');
			if (errorEl) errorEl.remove();
		};

		const updatePopupLayout = (targetMode) => {
			if (!popupRoot) return;
			const forms = popupRoot.querySelectorAll('[data-form]');
			const titles = popupRoot.querySelectorAll('[data-title]');
			const wrapperButtons = popupRoot.querySelectorAll('[data-wrapper-button]');

			forms.forEach(formItem => formItem.classList.toggle('is-hidden', formItem.getAttribute('data-form') !== targetMode));
			titles.forEach(titleItem => titleItem.classList.toggle('is-hidden', titleItem.getAttribute('data-title') !== targetMode));
			wrapperButtons.forEach(wrapperItem => wrapperItem.classList.toggle('is-hidden', wrapperItem.getAttribute('data-wrapper-button') === targetMode));
		};

		requiredInputs.forEach((input) => {
			const wrapperInput = input.closest('.wrapper-input') || input.closest('[data-wrapper-input]');
			const validateType = input.getAttribute('data-validate');
			const inputType = input.getAttribute('type');
			const inputName = input.getAttribute('name');
			const inputValue = input.value.trim();

			let isValid = false;
			let currentErrorMessage = VALIDATION_ERRORS.required;

			if (inputType !== 'checkbox' && inputValue === '') {
				isValid = false;
				currentErrorMessage = VALIDATION_ERRORS.required;
			} else if (inputType !== 'checkbox' && validateType && LIMITS[validateType]) {
				const expectedLength = LIMITS[validateType];
				isValid = inputValue.length === expectedLength;
				currentErrorMessage = `Поле должно содержать ровно ${expectedLength} символов`;
			} else {
				switch (true) {
					case inputName === 'first_name':
						isValid = inputValue.length >= 2;
						currentErrorMessage = VALIDATION_ERRORS.invalidName;
						break;
					case inputName === 'phone':
						isValid = inputValue.length >= 18;
						currentErrorMessage = VALIDATION_ERRORS.invalidPhone;
						break;
					case inputName === 'email':
						isValid = validateEmail(inputValue);
						currentErrorMessage = VALIDATION_ERRORS.invalidEmail;
						break;
					case inputType === 'checkbox':
						isValid = input.checked;
						currentErrorMessage = validateType === 'recaptcha' ? VALIDATION_ERRORS.recaptchaRequired : VALIDATION_ERRORS.agreementRequired;
						break;
					case inputName === 'theme':
						isValid = inputValue.length >= 3;
						currentErrorMessage = VALIDATION_ERRORS.invalidTheme;
						break;
					case inputName === 'message':
						isValid = inputValue.length >= 10;
						currentErrorMessage = VALIDATION_ERRORS.invalidMessage;
						break;
					default:
						isValid = true;
				}
			}

			if (wrapperInput) {
				if (!isValid) {
					showInputErrorMock(wrapperInput, currentErrorMessage);
				} else {
					clearInputErrorMock(wrapperInput);
				}
			}

			if (isValid) isFormValidCount++;
		});

		if (isFormValidCount === requiredInputs.length) {
			if (wrapper) {
				wrapper.style.height = `${wrapper.offsetHeight}px`;
			}

			form.classList.add('is-hidden');

			if (finishForm) finishForm.classList.remove('is-hidden');

			if (
				form.classList.contains('form-join') ||
				form.dataset.formFeedback === 'price-list' ||
				form.dataset.formFeedback === 'request'
			) {
				setTimeout(() => {
				if (wrapper) {
					wrapper.style.height = '';
					wrapper.classList.remove('send');
				}
				form.classList.remove('is-hidden');
				if (finishForm) finishForm.classList.add('is-hidden');
				}, 2000);
			}

			if (form.dataset.formFeedback === 'auth') {
				const emailInput = form.querySelector('input[type="email"]') || form.querySelector('[data-input="email"]');
				const passInput = form.querySelector('[data-input="password"]');
				const emailWrapper = emailInput?.closest('.wrapper-input') || emailInput?.closest('[data-wrapper-input]');
				const passWrapper = passInput?.closest('.wrapper-input') || passInput?.closest('[data-wrapper-input]');
				const submitBtn = form.querySelector('[type="submit"]');

				const emailValue = emailInput ? emailInput.value.trim() : '';
				const passValue = passInput ? (passInput.dataset.value || passInput.value).trim() : '';

				if (!emailValue) {
					if (emailWrapper) showInputErrorMock(emailWrapper, VALIDATION_ERRORS.required);
					if (submitBtn) submitBtn.disabled = false;
					form.classList.remove('is-hidden');
					return;
				}

				if (!validateEmail(emailValue)) {
					if (emailWrapper) showInputErrorMock(emailWrapper, VALIDATION_ERRORS.invalidEmail);
					if (submitBtn) submitBtn.disabled = false;
					form.classList.remove('is-hidden');
					return;
				}

				if (emailWrapper) clearInputErrorMock(emailWrapper);

				if (!passValue) {
					if (passWrapper) showInputErrorMock(passWrapper, VALIDATION_ERRORS.required);
					if (submitBtn) submitBtn.disabled = false;
					form.classList.remove('is-hidden');
					return;
				}

				if (typeof window.validateUserLoginMock === 'function' && window.validateUserLoginMock(emailValue, passValue)) {
					if (passWrapper) clearInputErrorMock(passWrapper);
					form.reset();
					window.executeSuccessfulLoginMock();
				} else {
					if (passWrapper) showInputErrorMock(passWrapper, VALIDATION_ERRORS.wrongAuth);
					if (submitBtn) submitBtn.disabled = false;
				}

				form.classList.remove('is-hidden');

				return;
			}

			if (form.dataset.formFeedback === 'registration') {
				const emailInput = form.querySelector('input[type="email"]') || form.querySelector('[data-input="email"]');
				const passInput = form.querySelector('[data-element="new-password"]');
				const confirmInput = form.querySelector('[data-element="confirm-password"]');
				const agreementInput = form.querySelector('[data-input="agreement"]');

				const emailValue = emailInput ? emailInput.value.trim() : '';
				const passValue = passInput ? (passInput.dataset.value || passInput.value).trim() : '';
				const confirmValue = confirmInput ? (confirmInput.dataset.value || confirmInput.value).trim() : '';

				let hasRegistrationErrors = false;

				if (!emailValue) {
					showInputErrorMock(emailInput?.closest('.wrapper-input'), VALIDATION_ERRORS.required);
					hasRegistrationErrors = true;
				} else if (!validateEmail(emailValue)) {
					showInputErrorMock(emailInput?.closest('.wrapper-input'), VALIDATION_ERRORS.invalidEmail);
					hasRegistrationErrors = true;
				} else {
					clearInputErrorMock(emailInput?.closest('.wrapper-input'));
				}

				if (!passValue) {
					showInputErrorMock(passInput?.closest('.wrapper-input'), VALIDATION_ERRORS.required);
					hasRegistrationErrors = true;
				} else {
					clearInputErrorMock(passInput?.closest('.wrapper-input'));
				}

				if (!confirmValue) {
					showInputErrorMock(confirmInput?.closest('.wrapper-input'), VALIDATION_ERRORS.required);
					hasRegistrationErrors = true;
				} else if (passValue !== confirmValue) {
					showInputErrorMock(confirmInput?.closest('.wrapper-input'), VALIDATION_ERRORS.passwordMismatch);
					hasRegistrationErrors = true;
				} else {
					clearInputErrorMock(confirmInput?.closest('.wrapper-input'));
				}

				if (agreementInput && !agreementInput.checked) {
					showInputErrorMock(agreementInput?.closest('.wrapper-input'), VALIDATION_ERRORS.agreementRequired);
					hasRegistrationErrors = true;
				} else {
					clearInputErrorMock(agreementInput?.closest('.wrapper-input'));
				}

				if (hasRegistrationErrors) {
					const submitBtn = form.querySelector('[type="submit"]');
					if (submitBtn) submitBtn.disabled = false;
					form.classList.remove('is-hidden');
					return;
				}

				if (typeof window.saveUserToDatabaseMock === 'function') {
					const isSaved = window.saveUserToDatabaseMock(emailValue, passValue);

					if (!isSaved) {
						showInputErrorMock(emailInput?.closest('.wrapper-input'), VALIDATION_ERRORS.userExists);
						const submitBtn = form.querySelector('[type="submit"]');
						if (submitBtn) submitBtn.disabled = false;
						form.classList.remove('is-hidden');
						return;
					}

					clearInputErrorMock(emailInput?.closest('.wrapper-input'));
					form.reset();
				}

				if (popupRoot) {
					const simplebarTrack = popupRoot.querySelector('.simplebar-track.simplebar-vertical');
					const splitLine = popupRoot.querySelector('[data-element="split-line"]');
					const regTitle = popupRoot.querySelector('[data-title="registration"]');
					const finishMsg = popupRoot.querySelector('[data-finish-form]');

					popupRoot.classList.add('is-status');

					if (regTitle) regTitle.classList.add('is-hidden');
					if (finishMsg) {
						finishMsg.textContent = 'Регистрация прошла успешно';
						finishMsg.classList.remove('is-hidden');
					}

					if (simplebarTrack) simplebarTrack.style.opacity = '0';
					if (splitLine) splitLine.classList.add('is-hidden');
					popupRoot.classList.remove('is-registration');

					setTimeout(() => {
						if (finishMsg) {
							finishMsg.textContent = '';
							finishMsg.classList.add('is-hidden');
						}
						if (splitLine) splitLine.classList.remove('is-hidden');
						if (simplebarTrack) simplebarTrack.style.opacity = '';

						popupRoot.classList.remove('is-status');

						updatePopupLayout('auth');
					}, 2000);
				}

				return;
			}

			if (form.dataset.formFeedback === 'forgot') {
				const emailInput = form.querySelector('input[type="email"]');
				const emailValue = emailInput ? emailInput.value.trim() : '';
				const emailWrapper = emailInput?.closest('.wrapper-input') || emailInput?.closest('[data-wrapper-input]');

				if (!emailValue) {
					if (emailWrapper) showInputErrorMock(emailWrapper, VALIDATION_ERRORS.required);
					const submitBtn = form.querySelector('[type="submit"]');
					if (submitBtn) submitBtn.disabled = false;
					form.classList.remove('is-hidden');
					return;
				}

				if (!validateEmail(emailValue)) {
					if (emailWrapper) showInputErrorMock(emailWrapper, VALIDATION_ERRORS.invalidEmail);
					const submitBtn = form.querySelector('[type="submit"]');
					if (submitBtn) submitBtn.disabled = false;
					form.classList.remove('is-hidden');
					return;
				}

				const db = localStorage.getItem('vortex_users_db') ? JSON.parse(localStorage.getItem('vortex_users_db')) : [];
				const userExists = db.some(user => user.email.toLowerCase() === emailValue.toLowerCase());

				if (!userExists) {
					if (emailWrapper) showInputErrorMock(emailWrapper, 'Пользователь с таким Email не найден!');
					const submitBtn = form.querySelector('[type="submit"]');
					if (submitBtn) submitBtn.disabled = false;
					form.classList.remove('is-hidden');
					return;
				}

				if (emailWrapper) clearInputErrorMock(emailWrapper);

				form.classList.add('is-hidden');
				form.reset();

				if (popupRoot) {
					const simplebarTrack = popupRoot.querySelector('.simplebar-track.simplebar-vertical');
					const splitLine = popupRoot.querySelector('[data-element="split-line"]');
					const finishMsg = popupRoot.querySelector('[data-finish-form]');

					if (simplebarTrack) simplebarTrack.style.opacity = '0';
					if (splitLine) splitLine.classList.add('is-hidden');

					if (finishMsg) {
						finishMsg.textContent = 'Ссылка для восстановления пароля отправлена';
						finishMsg.classList.remove('is-hidden');
					}

					setTimeout(() => {
						if (finishMsg) {
							finishMsg.classList.add('is-hidden');
							finishMsg.textContent = '';
						}

						popupRoot.classList.remove('is-registration');
						popupRoot.classList.remove('is-status');
						if (splitLine) splitLine.classList.remove('is-hidden');
						if (simplebarTrack) simplebarTrack.style.opacity = '';

						updatePopupLayout('auth');
					}, 2000);
				}

				return;
			}

			inputs.forEach((input) => {
			const wrapperInput = input.closest('.wrapper-input') || input.closest('[data-wrapper-input]');
			clearInputErrorMock(wrapperInput);
			input.value = '';
			if (wrapperInput) wrapperInput.classList.remove('filled');
			});
		}
	});
};

const initEducationFormValidation = (form) => {
    const popup = form.closest('[data-popup]');
    if (!popup) return;

    const validateField = (input) => {
        const value = input.value.trim();
        const inputName = input.getAttribute('name');

        if (!value) return false;

        switch (true) {
            case inputName === 'phone':
                return value.length >= 18 || value.replace(/\D/g, '').length >= 11;
            case inputName === 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            default:
                return value.length >= 2;
        }
    };

    const checkFormState = () => {
        let isFormValid = true;

        const requiredInputs = form.querySelectorAll('input[data-required="true"]');
        requiredInputs.forEach(input => {
            if (!validateField(input)) {
                isFormValid = false;
            }
        });

        const requiredSelects = form.querySelectorAll('[data-block="select"] [data-required="true"]');
        requiredSelects.forEach(btn => {
            const titleEl = btn.querySelector('[data-element="select-title"]');
            if (titleEl) {
                const text = titleEl.textContent.trim();
                if (text.startsWith('Выберите из списка')) {
                    isFormValid = false;
                }
            }
        });

        popup.classList.toggle('is-full', isFormValid);
    };

    form.addEventListener('input', (evt) => {
        const input = evt.target.closest('input[data-required="true"]');
        if (!input) return;

        checkFormState();

        const wrapper = input.closest('[data-wrapper-input]');
        if (wrapper && validateField(input)) {
            wrapper.classList.remove('is-error');
        }
    });

    form.addEventListener('click', (evt) => {
        const item = evt.target.closest('[data-select-item]');
        if (item) {
            setTimeout(checkFormState, 0);
        }
    });

    checkFormState();
};

document.addEventListener('DOMContentLoaded', () => {
    const feedbackForms = document.querySelectorAll('[data-form-feedback]');
    const profileForms = document.querySelectorAll('[data-form-info]');
    const educationForms = document.querySelectorAll('[data-form-education]');

    feedbackForms.forEach(form => handleFormSubmit(form));
    profileForms.forEach(form => initProfileFormValidation(form));
    educationForms.forEach(form => initEducationFormValidation(form));
});
