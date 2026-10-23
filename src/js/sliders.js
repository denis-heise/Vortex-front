let mainBannerSwiper = null;

const initMainBannerSlider = () => {
    const sliderElement = document.querySelector('[data-slider="main-banner"]');
    if (!sliderElement) {
        return;
    }

    if (mainBannerSwiper) {
        mainBannerSwiper.update();
        return;
    }

    mainBannerSwiper = new Swiper(sliderElement, {
        slidesPerView: 1,
        spaceBetween: 0,
        loop: true,
        watchSlidesProgress: true,
        navigation: {
            nextEl: sliderElement.querySelector('.swiper-button-next'),
            prevEl: sliderElement.querySelector('.swiper-button-prev')
        },
        pagination: {
            el: sliderElement.querySelector('.swiper-pagination'),
            clickable: true
        }
    });
};

const initDetailProductSliders = () => {
    const containers = document.querySelectorAll('[data-slider="product-gallery"]');
    if (!containers.length) return;

    containers.forEach((container) => {
        const sliderEl = container.classList.contains('swiper') ? container : container.querySelector('.swiper');
        if (!sliderEl) return;

        const prevBtn = container.querySelector('.swiper-button-prev');
        const nextBtn = container.querySelector('.swiper-button-next');
        const paginationEl = container.querySelector('.swiper-pagination');

        const isNewsDetail = container.closest('[data-block="news-detail-info"]') !== null;

        const defaultBreakpoints = {
            200: {
                slidesPerView: 1,
                spaceBetween: 30
            },
            1280: {
                slidesPerView: 2,
                spaceBetween: 16
            }
        };

        const newsBreakpoints = {
            200: {
                slidesPerView: 1,
                spaceBetween: 30,
            },
            650: {
                slidesPerView: 2,
                spaceBetween: 16
            }
        };

        new Swiper(sliderEl, {
            watchSlidesProgress: true,
            loop: true,
            spaceBetween: 16,
            slidesPerView: 1,
            navigation: {
                nextEl: nextBtn,
                prevEl: prevBtn
            },
            pagination: {
                el: paginationEl,
                clickable: true,
                bulletClass: 'swiper-pagination-bullet',
                bulletActiveClass: 'swiper-pagination-bullet-active'
            },
            breakpoints: isNewsDetail ? newsBreakpoints : defaultBreakpoints
        });
    });
};

const initNewsListSliders = () => {
    const containers = document.querySelectorAll('[data-slider="news-list"]');
    if (!containers.length) return;

    containers.forEach(container => {
        const sliderEl = container.querySelector('.swiper');
        if (!sliderEl) return;

        const slides = sliderEl.querySelectorAll('.swiper-slide');
        const totalSlides = slides.length;
        if (!totalSlides) return;

        const prevBtn = container.querySelector('.swiper-button-prev');
        const nextBtn = container.querySelector('.swiper-button-next');
        const navigationEl = container.querySelector('.swiper-navigation');

        let swiperInstance = null;

        const getActiveSlidesPerView = () => {
            const width = window.innerWidth;
            if (width >= 1450) return 6;
            if (width >= 1025) return 4;
            if (width >= 651) return 2;
            return 1;
        };

        const toggleSlider = () => {
            const slidesPerView = getActiveSlidesPerView();

            if (totalSlides <= slidesPerView) {
                if (swiperInstance) {
                    swiperInstance.destroy(true, true);
                    swiperInstance = null;
                }
                container.classList.add('slider-disabled');
                if (navigationEl) navigationEl.classList.add('is-hidden');
            } else {
                container.classList.remove('slider-disabled');
                if (navigationEl) navigationEl.classList.remove('is-hidden');

                if (!swiperInstance) {
                    swiperInstance = new Swiper(sliderEl, {
                        watchSlidesProgress: true,
                        loop: true,
                        spaceBetween: 16,
                        slidesPerView: 1,
                        navigation: {
                            nextEl: nextBtn,
                            prevEl: prevBtn
                        },
                        breakpoints: {
                            200: { slidesPerView: 1 },
                            651: { slidesPerView: 2 },
                            1025: { slidesPerView: 4 },
                            1450: { slidesPerView: 6 }
                        }
                    });
                }
            }
        };

        toggleSlider();

        window.addEventListener('resize', toggleSlider);
    });
};

const initReviewsSliders = () => {
    const containers = document.querySelectorAll('[data-slider="reviews"]');
    if (!containers.length) return;

    containers.forEach(container => {
        const sliderEl = container.querySelector('.reviews__slider');
        const prevBtn = container.querySelector('.swiper-button-prev');
        const nextBtn = container.querySelector('.swiper-button-next');
        const paginationEl = container.querySelector('.swiper-pagination');

        if (!sliderEl) return;

        new Swiper(sliderEl, {
            sliceVisibility: true,
            watchSlidesProgress: true,
            loop: true,
            spaceBetween: 20,
            slidesPerView: 1,
            navigation: {
                nextEl: nextBtn,
                prevEl: prevBtn,
                disabledClass: 'button--disabled'
            },
            pagination: {
                el: paginationEl,
                clickable: true,
                bulletClass: 'swiper-pagination-bullet',
                bulletActiveClass: 'swiper-pagination-bullet-active'
            },
            breakpoints: {
                200: {
                    slidesPerView: 1,
                    spaceBetween: 30
                },
                768: {
                    slidesPerView: 2,
                    spaceBetween: 16
                },
                1400: {
                    slidesPerView: 3,
                    spaceBetween: 16
                }
            }
        });
    });
};

document.addEventListener('DOMContentLoaded', () => {
    initMainBannerSlider();
	initReviewsSliders();
	initDetailProductSliders();
	initNewsListSliders();
});
