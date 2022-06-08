import { openModal } from './components/modals/modals.js';
import { txtConvertor } from './services/convertors/txt-convertor/txt-convertor.js';
import { initHeaderControl } from './services/header-control/header-control.js';
import { drawPrimitivesByType } from './services/draw-pcb/draw-pcb.js';
import { initUploadAreaControl } from './services/upload-area-contorl/upload-area-control.js';
import { initSelectFieldsControl } from './services/select-fields-control/select-fields-control.js';
import { initScrollOnGrabControl } from './services/scroll-on-grab-control/scroll-on-grab-control.js';
import { showProgressBar, hideProgressBar } from './components/progress-bar/progress-bar.js';

import { MODAL_TYPES } from './components/modals/_data/modal-types.js';

const PCB_WRAPPER = document.getElementById('pcb');
const SCALING_SELECT = document.getElementById('scaling-select');

const DEFAULT_SCALE = 1;
const IMAGE_SIZE_MULTIPLICITY = 10;

const mainTabData = {
    image: null,
    size: {
        width: null,
        height: null
    },
    pcbPrimitives: []
};

initHeaderControl();
initSelectFieldsControl();
initScrollOnGrabControl(PCB_WRAPPER);
const { FILE_INPUT, resetFileName } = initUploadAreaControl('upload-area');

FILE_INPUT.addEventListener('change', event => {
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
                                resetFileName();
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
        resetFileName();
        openModal(MODAL_TYPES.ERROR_MESSAGE, {
            heading: 'Помилка формату файлу',
            text: `Обраний файл не відповідає не підтримується додатком. 
            Списко файлів котрі підтримує додаток: ${FILE_INPUT.accept}`
        }).then();
    }
});

SCALING_SELECT.addEventListener('change', event => {
    if (mainTabData.image) {
        const value = +event.target.value;
        const { width, height } = mainTabData.size;
        mainTabData.image.setAttribute('width', `${width * value * IMAGE_SIZE_MULTIPLICITY}`);
        mainTabData.image.setAttribute('height', `${height * value * IMAGE_SIZE_MULTIPLICITY}`);
    }
});


export {
    mainTabData,
}
