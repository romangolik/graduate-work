import { openModal } from "./components/modals/modals.js";
import { txtConvertor } from "./services/convertors/txt-convertor/txt-convertor.js";
import { initScrollOnGrab } from "./services/scroll-on-grab/scroll-on-grab.js";
import { drawPrimitivesByType } from "./services/draw-pcb/draw-pcb.js";
import { showProgressBar, hideProgressBar } from "./components/progress-bar/progress-bar.js";

import { MODAL_TYPES } from "./components/modals/_data/modal-types.js";

const TAB_ITEM = document.querySelector('.tabs__item');
const TABS_WRAPPER = document.querySelector('.tabs__wrapper');
const HEADER_LINKS = document.querySelectorAll('.header__navigation-item');

const FILE_INPUT = document.getElementById('file');
const PCB_WRAPPER = document.getElementById('pcb');
const UPLOAD_AREA = document.getElementById('upload-area');
const SELECTED_FILE_SPAN = document.getElementById('file-name');
const SCALING_SELECT = document.getElementById('scaling-select');

const DEFAULT_SCALE = 1;
const IMAGE_SIZE_MULTIPLICITY = 10;

let activeTab = 0;

const mainTabData = {
    image: null,
    size: {
        width: null,
        height: null
    },
    pcbPrimitives: []
};

initScrollOnGrab(PCB_WRAPPER);

FILE_INPUT.addEventListener('change', event => {
    SELECTED_FILE_SPAN.textContent = event.target.files[0].name;
    if (mainTabData.image) {
        mainTabData.image.remove();
    }
    if (new RegExp('(' + FILE_INPUT.accept.split(',')
        .join('|') + ')$')
        .test(event.target.files[0].name)
    ) {
        showProgressBar();
        fetch(URL.createObjectURL(event.target.files[0]))
            .then(data => data.text())
            .then(data => {
                try {
                    mainTabData.pcbPrimitives = txtConvertor(data);

                    drawPrimitivesByType(mainTabData.pcbPrimitives, IMAGE_SIZE_MULTIPLICITY)
                        .then(data => {
                            if (data) {
                                mainTabData.image = data.image;
                                mainTabData.size.width = data.size.width;
                                mainTabData.size.height = data.size.height;
                                PCB_WRAPPER.appendChild(mainTabData.image);
                                SCALING_SELECT.value = DEFAULT_SCALE;
                            } else {
                                FILE_INPUT.value = null;
                                SELECTED_FILE_SPAN.textContent = 'Файл не обрано';
                            }
                            hideProgressBar();
                        });
                } catch (message) {
                    hideProgressBar();
                    openModal(MODAL_TYPES.ERROR_MESSAGE, {
                        heading: 'Помилка конвертування',
                        text: `Дані файлу є пошкодженими: "${message}"`
                    }).then();
                }
            });
    } else {
        FILE_INPUT.value = null;
        SELECTED_FILE_SPAN.textContent = 'Файл не обрано';
        openModal(MODAL_TYPES.ERROR_MESSAGE, {
            heading: 'Помилка формату файлу',
            text: `Обраний файл не відповідає не підтримується додатком. 
            Списко файлів котрі підтримує додаток: ${FILE_INPUT.accept}`
        }).then();
    }
});

UPLOAD_AREA.addEventListener('dragover', () => {
    UPLOAD_AREA.classList.add('upload-area__dragover');
});

UPLOAD_AREA.addEventListener('dragleave', () => {
    UPLOAD_AREA.classList.remove('upload-area__dragover');
});

UPLOAD_AREA.addEventListener('drop', () => {
    UPLOAD_AREA.classList.remove('upload-area__dragover');
});

SCALING_SELECT.addEventListener('change', event => {
    const value = +event.target.value;
    const { width, height } = mainTabData.size;
    mainTabData.image.setAttribute('width', `${width * value * IMAGE_SIZE_MULTIPLICITY}`);
    mainTabData.image.setAttribute('height', `${height * value * IMAGE_SIZE_MULTIPLICITY}`);
});

HEADER_LINKS.forEach((link, index) => {
    link.addEventListener('click', event => {
        event.preventDefault();
        activeTab = index;
        TABS_WRAPPER.style.transform = `translateX(${-TAB_ITEM.getBoundingClientRect().width * activeTab}px)`;
        HEADER_LINKS.forEach(item => item.classList.remove('header__navigation-item_active'));
        link.classList.add('header__navigation-item_active');
    });
});

window.addEventListener('resize', () => {
    TABS_WRAPPER.style.transform = `translateX(${-TAB_ITEM.getBoundingClientRect().width * activeTab}px)`;
});

export {
    mainTabData,
}
