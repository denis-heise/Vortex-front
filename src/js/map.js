const initContactsMap = () => {
	const mapContainer = document.querySelector('[data-map-contacts]');
	if (!mapContainer) return;

	const points = [
		{ coords: [55.8038, 37.6377], title: 'Главный офис' },
		{ coords: [55.6712, 37.9358], title: 'Склад какао Москва' },
		{ coords: [55.6712, 37.9358], title: 'Склад кофе Москва' },
		{ coords: [55.7558, 37.6173], title: 'Группа по взаимодействию с клиентами' },
		{ coords: [59.9342, 30.3350], title: 'Склад Санкт-Петербург' },
		{ coords: [55.6712, 37.9358], title: 'Служба доставки' },
		{ coords: [55.6712, 37.9358], title: 'Тренинг-центр' }
	];

	const zoomLevel = 10;
	let currentCenter = [55.7520, 37.6175];

	ymaps.ready(() => {
		const map = new ymaps.Map(mapContainer, {
			center: currentCenter,
			zoom: zoomLevel,
			controls: []
		});

		points.forEach((point) => {
			const marker = new ymaps.Placemark(
				point.coords,
				{
				hintContent: point.title,
				balloonContent: `<b>${point.title}</b>`
				},
				{ preset: 'islands#greenIcon' }
			);
			map.geoObjects.add(marker);
		});

		document.addEventListener('click', (evt) => {
			const showBtn = evt.target.closest('[data-button="show-on-map"]');
			const zoomInBtn = evt.target.closest('[data-button="zoom-in"]');
			const zoomOutBtn = evt.target.closest('[data-button="zoom-out"]');
			const centerBtn = evt.target.closest('[data-button="map-center"]');

			if (showBtn) {
				const index = parseInt(showBtn.getAttribute('data-index'), 10) - 1;
				if (!points[index]) return;

				currentCenter = points[index].coords;

				map.setCenter(currentCenter, zoomLevel, {
				checkZoomRange: true,
				duration: 800,
				timingFunction: 'ease-in-out'
				});

				mapContainer.scrollIntoView({
				behavior: 'smooth',
				block: 'center'
				});
			}

			if (zoomInBtn) {
				map.setZoom(map.getZoom() + 1, { duration: 300 });
			}

			if (zoomOutBtn) {
				map.setZoom(map.getZoom() - 1, { duration: 300 });
			}

			if (centerBtn) {
				map.setCenter(currentCenter, zoomLevel, {
				checkZoomRange: true,
				duration: 800,
				timingFunction: 'ease-in-out'
				});
			}
		});
	});
};

initContactsMap();
