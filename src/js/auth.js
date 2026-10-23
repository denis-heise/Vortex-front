const initAuthStorageState = () => {
	const isAuthorized = localStorage.getItem('isUserAuthorized') === 'true';
	const currentPath = window.location.pathname;
	const privatePages = ['orders', 'favorites', 'profile', 'reserves'];
	const isPrivatePage = privatePages.some(page => currentPath.includes(page));

	if (isPrivatePage && !isAuthorized) {
		window.location.href = '/';
		return;
	}

	const loginBtns = document.querySelectorAll('[data-element="login"]');
	const exitBtns = document.querySelectorAll('[data-element="exit"]');
	const popupLoginRoot = document.querySelector('[data-popup="login"]');
	const protectedElements = document.querySelectorAll('[data-need-auth]');
	const hiddenElements = document.querySelectorAll('[data-hidden-auth]');

	const updateUI = (isAuthenticated) => {
		document.body.classList.toggle('is-authorized', isAuthenticated);
		loginBtns.forEach(btn => btn.classList.toggle('is-hidden', isAuthenticated));
		exitBtns.forEach(exitButton => exitButton.classList.toggle('is-hidden', !isAuthenticated));
		protectedElements.forEach(protectedElement => protectedElement.classList.toggle('is-hidden', !isAuthenticated));
		hiddenElements.forEach(hiddenElement => hiddenElement.classList.toggle('is-hidden', isAuthenticated));
		if (isAuthenticated && typeof syncOrdersFlexWidths === 'function') syncOrdersFlexWidths();
		if (typeof initSvgTraffic === 'function') initSvgTraffic();
	};

	const closeAuthPopups = () => {
		const otherOverlay = document.querySelector('[data-popup="other"]');
		if (otherOverlay) otherOverlay.classList.add('is-hidden');
		if (popupLoginRoot) popupLoginRoot.classList.add('is-hidden');
	};

	const getLocalUsersDatabase = () => {
		const users = localStorage.getItem('vortex_users_db');
		return users ? JSON.parse(users) : [];
	};

	window.saveUserToDatabaseMock = (email, password) => {
		const database = getLocalUsersDatabase();
		const userExists = database.some(user => user.email.toLowerCase() === email.toLowerCase());
		if (userExists) return false;
		database.push({ email, password });
		localStorage.setItem('vortex_users_db', JSON.stringify(database));
		return true;
	};

	window.validateUserLoginMock = (email, password) => {
		const database = getLocalUsersDatabase();
		return database.some(user => user.email.toLowerCase() === email.toLowerCase() && user.password === password);
	};

	window.executeSuccessfulLoginMock = () => {
		localStorage.setItem('isUserAuthorized', 'true');
		updateUI(true);
		closeAuthPopups();
	};

	loginBtns.forEach((btn) => {
		btn.addEventListener('click', (evt) => {
			evt.preventDefault();
			evt.stopPropagation();

			const buttonsOpen = document.querySelectorAll('[data-button="open"]');
			const otherOverlay = document.querySelector('[data-popup="other"]');

			if (otherOverlay) otherOverlay.classList.remove('is-hidden');
			if (popupLoginRoot) popupLoginRoot.classList.remove('is-hidden');
			buttonsOpen.forEach(button => button.classList.remove('is-open'));
			if (typeof toggleScroll === 'function') toggleScroll();
		});
	});

	exitBtns.forEach((exitButton) => {
		exitButton.addEventListener('click', (evt) => {
			evt.preventDefault();
			localStorage.setItem('isUserAuthorized', 'false');
			updateUI(false);

			const updatedPath = window.location.pathname;
			if (privatePages.some(page => updatedPath.includes(page))) {
				window.location.href = 'index.html';
			}
		});
	});

	updateUI(isAuthorized);
};

window.toggleElements = (popup, targetMode) => {
	const forms = popup.querySelectorAll('[data-form]');
	const titles = popup.querySelectorAll('[data-title]');
	const wrapperButtons = popup.querySelectorAll('[data-wrapper-button]');

	popup.classList.toggle('is-registration', targetMode === 'registration');
	forms.forEach(form => form.classList.toggle('is-hidden', form.getAttribute('data-form') !== targetMode));
	titles.forEach(title => title.classList.toggle('is-hidden', title.getAttribute('data-title') !== targetMode));
	wrapperButtons.forEach((wrapper) => wrapper.classList.toggle('is-hidden', wrapper.getAttribute('data-wrapper-button') === targetMode));
	popup.classList.toggle('is-status', targetMode === 'forgot');
};

const initPopupTabsToggle = () => {
	const popup = document.querySelector('[data-popup="login"]');
	if (!popup) return;

	popup.addEventListener('click', (evt) => {
		const toggleBtn = evt.target.closest('[data-button-toggle]');
		if (!toggleBtn) return;

		evt.preventDefault();
		const targetMode = toggleBtn.getAttribute('data-button-toggle');
		window.toggleElements(popup, targetMode);
	});
};

const initDynamicCurrencyRate = () => {
	const dateEl = document.querySelector('[data-element="rate-date"]');
	const valueEl = document.querySelector('[data-element="rate-value"]');
	if (!dateEl || !valueEl) return;

	const currentDate = new Date();
	const day = String(currentDate.getDate()).padStart(2, '0');
	const month = String(currentDate.getMonth() + 1).padStart(2, '0');
	const year = currentDate.getFullYear();
	const formattedDate = `${day}.${month}.${year}`;

	window.CBR_XML_Daily_Ru = (data) => {
		try {
			if (data && data.Valute && data.Valute.USD) {
				const usdRate = data.Valute.USD.Value;
				dateEl.textContent = formattedDate;
				valueEl.textContent = usdRate.toFixed(4).replace('.', ',');
			}
		} catch (e) {
			dateEl.textContent = formattedDate;
			valueEl.textContent = '77,9556';
		} finally {
			delete window.CBR_XML_Daily_Ru;
			const scriptEl = document.getElementById('jsonp-cbr');
			if (scriptEl) scriptEl.remove();
		}
	};

	const script = document.createElement('script');
	script.src = 'https://www.cbr-xml-daily.ru/daily_jsonp.js';
	script.id = 'jsonp-cbr';
	script.onerror = () => {
		dateEl.textContent = formattedDate;
		valueEl.textContent = '77,9556';
		if (window.CBR_XML_Daily_Ru) delete window.CBR_XML_Daily_Ru;
	};

	document.head.appendChild(script);
};
