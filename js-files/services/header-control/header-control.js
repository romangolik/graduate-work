export const initHeaderControl = () => {
    const BURGER = document.getElementById('burger');
    const OVERLAY = document.getElementById('overlay');
    const TAB_ITEMS = document.querySelectorAll('.tabs__item');
    const HEADER_NAVIGATION = document.getElementById('header-navigation');
    const HEADER_LINKS = document.querySelectorAll('.header__navigation-item');

    let activeTab = 0;

    const closeNavigationMenu = () => {
        OVERLAY.classList.remove('overlay_visible');
        BURGER.classList.remove('header__burger_active');
        HEADER_NAVIGATION.classList.remove('header__navigation_visible');
    }

    const openNavigationMenu = () => {
        OVERLAY.classList.add('overlay_visible');
        BURGER.classList.add('header__burger_active');
        HEADER_NAVIGATION.classList.add('header__navigation_visible');
    }

    HEADER_LINKS.forEach((link, index) => {
        link.addEventListener('click', event => {
            event.preventDefault();

            activeTab = index;
            TAB_ITEMS.forEach(item => item.classList.remove('tabs__item_show'));
            HEADER_LINKS.forEach(item => item.classList.remove('header__navigation-item_active'));

            link.classList.add('header__navigation-item_active');
            TAB_ITEMS[activeTab].classList.add('tabs__item_show');

            closeNavigationMenu();
        });
    });

    BURGER.addEventListener('click', () => {
        if (BURGER.classList.contains('header__burger_active')) {
            closeNavigationMenu();
        } else {
            openNavigationMenu();
        }
    });

    OVERLAY.addEventListener('click', () => closeNavigationMenu());

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeNavigationMenu();
        }
    });
}
