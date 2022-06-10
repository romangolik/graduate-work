export const initSidebarControl = () => {
    const BURGER = document.getElementById('burger');
    const OVERLAY = document.getElementById('overlay');
    const TAB_ITEMS = document.querySelectorAll('.tabs__item');
    const SIDEBAR = document.getElementById('sidebar');
    const SIDEBAR_LINKS = document.querySelectorAll('.sidebar__navigation-item');

    let activeTab = 0;

    const closeNavigationMenu = () => {
        OVERLAY.classList.remove('overlay_visible');
        BURGER.classList.remove('sidebar__burger_active');
        SIDEBAR.classList.remove('sidebar_visible');
    }

    const openNavigationMenu = () => {
        OVERLAY.classList.add('overlay_visible');
        BURGER.classList.add('sidebar__burger_active');
        SIDEBAR.classList.add('sidebar_visible');
    }

    SIDEBAR_LINKS.forEach((link, index) => {
        link.addEventListener('click', event => {
            event.preventDefault();

            activeTab = index;
            TAB_ITEMS.forEach(item => item.classList.remove('tabs__item_show'));
            SIDEBAR_LINKS.forEach(item => item.classList.remove('sidebar__navigation-item_active'));

            link.classList.add('sidebar__navigation-item_active');
            TAB_ITEMS[activeTab].classList.add('tabs__item_show');

            closeNavigationMenu();
        });
    });

    BURGER.addEventListener('click', () => {
        if (BURGER.classList.contains('sidebar__burger_active')) {
            closeNavigationMenu();
        } else {
            openNavigationMenu();
        }
    });

    OVERLAY.addEventListener('click', () => closeNavigationMenu());

    window.addEventListener('resize', () => {
        if (window.innerWidth > 960) {
            closeNavigationMenu();
        }
    });
}
