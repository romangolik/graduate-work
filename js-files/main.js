import { openModal } from './components/modals/modals.js';
import { txtConvertor } from './services/convertors/txt-convertor/txt-convertor.js';
import { initSidebarControl } from './services/sidebar-control/sidebar-control.js';
import { drawPrimitivesByType } from './services/draw-pcb/draw-pcb.js';
import { initZoomImageControl } from './services/zoom-image-control/zoom-image-control.js';
import { initUploadAreaControl } from './services/upload-area-contorl/upload-area-control.js';
import { getPCBInformationHtml } from './services/pcb-information-template/pcb-information-template.js';
import { initSelectFieldsControl } from './services/select-fields-control/select-fields-control.js';
import { showProgressBar, hideProgressBar } from './components/progress-bar/progress-bar.js';

import { MODAL_TYPES } from './components/modals/_data/modal-types.js';

const PCB_INFORMATION = document.getElementById('pcb-information');

const mainTabData = {
    image: null,
    description: null,
    size: {
        width: null,
        height: null
    },
    pcbPrimitives: []
};

initSidebarControl();
initSelectFieldsControl();
const { IMAGE_WRAPPER, resetScalingSelectValue } =
    initZoomImageControl(
        'pcb',
        'scaling-select',
        (event, imageSizeMultiplicity) => {
            if (mainTabData.image) {
                const value = +event.target.value;
                const { width, height } = mainTabData.size;
                mainTabData.image.setAttribute('width', `${width * value * imageSizeMultiplicity}`);
                mainTabData.image.setAttribute('height', `${height * value * imageSizeMultiplicity}`);
            }
        }
    );
const { FILE_INPUT, resetFileName } = initUploadAreaControl('upload-area');



FILE_INPUT.addEventListener('change', event => {
    if (event.target.files[0]) {
        if (mainTabData.image) {
            mainTabData.image.remove();
        }
        if (mainTabData.description) {
            mainTabData.description.remove();
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
                        txtConvertor(data).then(convertedData => {
                            mainTabData.pcbPrimitives = convertedData;

                            drawPrimitivesByType(mainTabData.pcbPrimitives)
                                .then(data => {
                                    if (data) {
                                        mainTabData.image = data.image;
                                        mainTabData.size.width = data.size.width;
                                        mainTabData.size.height = data.size.height;
                                        IMAGE_WRAPPER.appendChild(mainTabData.image);
                                        resetScalingSelectValue();
                                    } else {
                                        FILE_INPUT.value = null;
                                        resetFileName();
                                    }

                                    PCB_INFORMATION.innerHTML = getPCBInformationHtml(data ?
                                        { primitives: convertedData, size: mainTabData.size } :
                                        null
                                    );
                                    hideProgressBar();
                                });
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
    }
});

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

const AUTO_CONTROL_PANEL = document.getElementById('auto-control-panel');
const MANUAL_CONTROL_PANEL = document.getElementById('manual-control-panel');

const TO_AUTO_CONTROL_BUTTON = document.getElementById('to-auto-control-panel');
const TO_MANUAL_CONTROL_BUTTON = document.getElementById('to-manual-control-panel');

TO_AUTO_CONTROL_BUTTON.addEventListener('click', () => {
    AUTO_CONTROL_PANEL.removeAttribute('hidden');
    MANUAL_CONTROL_PANEL.setAttribute('hidden', '');
});

TO_MANUAL_CONTROL_BUTTON.addEventListener('click', () => {
    MANUAL_CONTROL_PANEL.removeAttribute('hidden');
    AUTO_CONTROL_PANEL.setAttribute('hidden', '');
});

export {
    mainTabData,
}
