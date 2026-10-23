const alignHeightsInParent = (targetSelector, isGrid = false) => {
    const align = () => {
        const targets = document.querySelectorAll(targetSelector);
        if (targets.length === 0) return;

        if (window.innerWidth <= 650) {
            targets.forEach((el) => {
                el.style.height = '';
            });
            return;
        }

        const groups = new Map();

        targets.forEach((el) => {
            const parent = el.closest('[data-block="parent"]');
            if (!parent) return;

            if (!groups.has(parent)) {
                groups.set(parent, []);
            }
            groups.get(parent).push(el);
        });

        groups.forEach((elements) => {
            elements.forEach((el) => {
                el.style.height = 'auto';
            });

            if (isGrid) {
                const rows = new Map();

                elements.forEach((el) => {
                    const rowTop = Math.round(el.getBoundingClientRect().top);
                    if (!rows.has(rowTop)) {
                        rows.set(rowTop, []);
                    }
                    rows.get(rowTop).push(el);
                });

                rows.forEach((rowElements) => {
                    let maxRowHeight = 0;
                    rowElements.forEach((el) => {
                        const currentHeight = el.offsetHeight;
                        if (currentHeight > maxRowHeight) maxRowHeight = currentHeight;
                    });

                    rowElements.forEach((el) => {
                        el.style.height = `${maxRowHeight}px`;
                    });
                });
            } else {
                let maxHeight = 0;
                elements.forEach((el) => {
                    const currentHeight = el.offsetHeight;
                    if (currentHeight > maxHeight) maxHeight = currentHeight;
                });

                elements.forEach((el) => {
                    el.style.height = `${maxHeight}px`;
                });
            }
        });
    };

    align();
    window.addEventListener('resize', align);
};

const initPopupScrollableElements = () => {
    const elements = document.querySelectorAll('[data-element="scrollable"]');
    if (!elements.length) return;

    elements.forEach((element) => {
        const popup = element.closest('[data-popup]');
        if (!popup) return;

        const scrollableContainer = popup.querySelector('.simplebar-content-wrapper') ||
									popup.querySelector('[data-scrollable-block]');
        if (!scrollableContainer) return;

        let ticking = false;

        const updatePosition = () => {
            const currentScrollTop = scrollableContainer.scrollTop;
            element.style.transform = `translateY(${-currentScrollTop}px)`;
            ticking = false;
        };

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(updatePosition);
                ticking = true;
            }
        };

        scrollableContainer.addEventListener('scroll', handleScroll, { passive: true });

        updatePosition();
    });
};

const initTableHorizontalScroll = () => {
	const handleTableWheel = (evt, container) => {
		if (Math.abs(evt.deltaX) > Math.abs(evt.deltaY)) return;

		if (evt.deltaY !== 0) {
			const targetScroll = container.querySelector('.simplebar-content-wrapper') || container;
			const { scrollLeft, scrollWidth, clientWidth } = targetScroll;
			const isScrollingLeft = evt.deltaY < 0;
			const isScrollingRight = evt.deltaY > 0;

			const canScrollLeft = scrollLeft > 0;
			const canScrollRight = Math.ceil(scrollLeft + clientWidth) < scrollWidth;

			if ((isScrollingLeft && canScrollLeft) || (isScrollingRight && canScrollRight)) {
				evt.preventDefault();
				targetScroll.scrollLeft += evt.deltaY;
			}
		}
	};

	const scrollableTables = document.querySelectorAll('[data-table-block]');

	scrollableTables.forEach((container) => {
		if (window.innerWidth < 1450) {
            container.addEventListener('wheel', (evt) => handleTableWheel(evt, container), { passive: false });
        }
	});
};

const syncOrdersFlexWidths = () => {
    const tableElement = document.querySelector('[data-block="table"]');
    if (!tableElement) {
        return;
    }

    const allCells = tableElement.querySelectorAll('[data-cell]');

    allCells.forEach((cell) => {
        cell.style.width = '';
    });

    if (window.innerWidth <= 1050) {
        return;
    }

    let totalColumns = 0;
    allCells.forEach((cell) => {
        const cellNumber = parseInt(cell.getAttribute('data-cell')) || 0;
        if (cellNumber > totalColumns) {
            totalColumns = cellNumber;
        }
    });

    if (totalColumns === 0) {
        return;
    }

    const maximumColumnWidths = Array(totalColumns).fill(0);

    allCells.forEach((cell) => {
        const cellIndex = parseInt(cell.getAttribute('data-cell')) - 1;

        if (cellIndex >= 0 && cellIndex < totalColumns) {
            const previousDisplay = cell.style.display;
            const previousPosition = cell.style.position;
            const previousWhiteSpace = cell.style.whiteSpace;

            cell.style.display = 'inline-block';
            cell.style.position = 'absolute';
            cell.style.whiteSpace = 'nowrap';

            const currentWidth = cell.getBoundingClientRect().width;

            cell.style.display = previousDisplay;
            cell.style.position = previousPosition;
            cell.style.whiteSpace = previousWhiteSpace;

            if (currentWidth > maximumColumnWidths[cellIndex]) {
                maximumColumnWidths[cellIndex] = currentWidth;
            }
        }
    });

    allCells.forEach((cell) => {
        const cellIndex = parseInt(cell.getAttribute('data-cell')) - 1;

        if (cellIndex >= 0 && cellIndex < totalColumns) {
            const finalWidth = Math.ceil(maximumColumnWidths[cellIndex]) + 24;
            cell.style.width = `${finalWidth}px`;
        }
    });
};

const initOrdersTableFlexSync = () => {
    if (typeof syncOrdersFlexWidths === 'function') syncOrdersFlexWidths();

    window.addEventListener('resize', () => {
        if (typeof syncOrdersFlexWidths === 'function') syncOrdersFlexWidths();
    });
};

const setTotalPricesInlineWidth = () => {
    const totalPriceElements = document.querySelectorAll('[data-element="total-price"]');
    if (!totalPriceElements.length) return;

	totalPriceElements.forEach((el) => {
        const width = el.getBoundingClientRect().width;
        el.style.width = `${width}px`;
    });
};

const alignBasketResultWidth = () => {
    const tables = document.querySelectorAll('[data-table-products]');
    tables.forEach((table) => {
        const resultBody = table.querySelector('[data-block="basket-result-body"]');

        if (!resultBody) return;

        if (window.innerWidth <= 992) {
            resultBody.style.width = '';
            return;
        }

        const firstCard = table.querySelector('[data-basket-card]');

        if (!firstCard) return;

        const columns = Array.from(firstCard.children);

        const titleIndex = columns.findIndex(col => col.classList.contains('products-table__cell--title'));
        const actionIndex = columns.findIndex(col => col.classList.contains('products-table__cell--action'));

        if (titleIndex === -1 || actionIndex === -1 || titleIndex >= actionIndex) return;

        const targetColumns = columns.slice(titleIndex + 1, actionIndex);
        const width = window.innerWidth;
        const isSimple = table.classList.contains('products-table--simple');
        let offset;

        if (width >= 1875) {
            offset = isSimple ? 44 : 23;
        } else if (width >= 1675 && width < 1875) {
            offset = isSimple ? -25 : -43;
        } else if (width >= 1575 && width < 1675) {
            offset = isSimple ? -50 : -68;
        } else if (width > 992 && width < 1575) {
            offset = isSimple ? -52 : -71;
        }

        const totalWidth = targetColumns.reduce((sum, col) => {
            return sum + col.getBoundingClientRect().width;
        }, 0) - offset;

        resultBody.style.width = `${totalWidth}px`;
    });
};

const initSvgTraffic = (
	containerSelector = '[data-animate-container="traffic"]',
	routesSelector = '[data-animate-route]',
	routeAttr = 'data-animate-route',
	elementAttr = 'data-animate-element',
	groupAttr = 'data-animate-group'
) => {
	if (typeof gsap === "undefined" || typeof window.MotionPathPlugin === "undefined") return;

	const container = document.querySelector(containerSelector);
	const routes = document.querySelectorAll(routesSelector);

	if (!container || routes.length === 0) return;

	const isMobile = window.innerWidth <= 768;
	const isAuthorized = document.body.classList.contains('is-authorized');
	const isInitialized = container.getAttribute('data-traffic-active') === 'true';

	if (isMobile) {
		if (isInitialized) {
			container.querySelectorAll(`[${elementAttr}]`).forEach(element => {
				gsap.killTweensOf(element);
				element.remove();
			});
			container.removeAttribute('data-traffic-active');
		}
		return;
	}

	gsap.registerPlugin(MotionPathPlugin);

	const vehicleSettings = {
		airplane: { duration: 10, autoRotate: -50, start: 0, end: 1 },
		ship: { duration: 22, autoRotate: 180, start: 0, end: 1 },
		truck: { duration: 14, autoRotate: 0, start: 0, end: 1 }
	};

	const spawnVehicle = (routeElement, type, index, totalForRoute) => {
		const template = document.getElementById(`tpl-${type}`);
		if (!template) return;

		const clone = template.cloneNode(true);
		clone.removeAttribute("id");
		clone.setAttribute(elementAttr, type);

		container.appendChild(clone);

		const settings = vehicleSettings[type];
		const routeLength = routeElement.getTotalLength();
		const pixelsPerSecond = type === "airplane" ? 100 : type === "truck" ? 70 : 40;
		let duration = routeLength / pixelsPerSecond;
		if (routeLength < 300) duration = duration * 0.7;
		if (duration < 3) duration = 3;

		const startPoint = routeElement.getPointAtLength(0);
		const endPoint = routeElement.getPointAtLength(routeLength);
		const isWayInverted = startPoint.x > endPoint.x;

		let currentScaleY = 1;
		if (type === "truck") {
			currentScaleY = isWayInverted ? -1 : 1;
		} else if (type === "ship") {
			currentScaleY = isWayInverted ? 1 : -1;
		}

		gsap.set(clone, {
			x: 0,
			y: 0,
			xPercent: -50,
			yPercent: -50,
			opacity: 0,
			scaleY: currentScaleY,
			transformOrigin: "50% 50%"
		});

		const randomScatter = gsap.utils.random(0, 2);
		let routeOffset = 0;

		const groupName = routeElement.getAttribute(groupAttr);
		if (groupName) {
			const groupRoutes = Array.from(document.querySelectorAll(`[${groupAttr}="${groupName}"]`));
			const currentRouteIndex = groupRoutes.indexOf(routeElement);
			if (currentRouteIndex !== -1) routeOffset = currentRouteIndex * 1.5;
		}

		const tl = gsap.timeline({
			repeat: -1,
			delay: randomScatter + routeOffset
		});

		routeElement.timeline = tl;

		tl.to(clone, {
			duration,
			ease: "none",
			motionPath: {
				path: routeElement,
				align: routeElement,
				alignOrigin: [0.5, 0.5],
				autoRotate: settings.autoRotate,
				start: settings.start,
				end: settings.end
			}
		}, 0);

		tl.to(clone, {
			duration: duration * 0.1,
			opacity: 1,
			ease: "power1.inOut"
		}, 0);

		tl.to(clone, {
			duration: duration * 0.1,
			opacity: 0,
			ease: "power1.inOut"
		}, duration * 0.9);
	};

	if (!isInitialized) {
		routes.forEach((route, index) => spawnVehicle(route, route.getAttribute(routeAttr), index, 2));
		container.setAttribute('data-traffic-active', 'true');
	}

	routes.forEach(route => {
		if (route.timeline) isAuthorized ? route.timeline.pause() : route.timeline.play();
	});
};

