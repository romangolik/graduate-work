import { openModal } from './components/modals/modals.js';
import { txtConvertor } from './services/convertors/txt-convertor/txt-convertor.js';
import { initSidebarControl } from './services/sidebar-control/sidebar-control.js';
import { drawPrimitivesByType } from './services/draw-pcb/draw-pcb.js';
import { initZoomImageControl } from './services/zoom-image-control/zoom-image-control.js';
import { resetTcamSettingsData } from './tcam-settings-data.js';
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

                                    resetTcamSettingsData();
                                    hideProgressBar();
                                });
                        });
                    } catch (message) {
                        hideProgressBar();
                        resetTcamSettingsData();
                        openModal(MODAL_TYPES.ERROR_MESSAGE, {
                            heading: 'Помилка конвертування',
                            text: `Дані файлу є пошкодженими: "${message}"`
                        }).then();
                    }
                });
        } else {
            FILE_INPUT.value = null;
            resetFileName();
            resetTcamSettingsData();
            openModal(MODAL_TYPES.ERROR_MESSAGE, {
                heading: 'Помилка формату файлу',
                text: `Обраний файл не відповідає не підтримується додатком. 
            Списко файлів котрі підтримує додаток: ${FILE_INPUT.accept}`
            }).then();
        }
    }
});

export {
    mainTabData,
}
