const SCROLL_TO_TOP_BUTTON = document.getElementById('scroll-to-top');
const ABOUT_APPLICATION_CONTENT = document.getElementById('about-application-content');

SCROLL_TO_TOP_BUTTON.addEventListener('click', () => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
});

window.addEventListener('scroll', event => {
    const rect = ABOUT_APPLICATION_CONTENT.getBoundingClientRect();

    if (document.body.scrollTop <= rect.bottom || document.documentElement.scrollTop <= rect.bottom) {
        SCROLL_TO_TOP_BUTTON.setAttribute('hidden', '');
    } else {
        SCROLL_TO_TOP_BUTTON.removeAttribute('hidden');
    }
});
