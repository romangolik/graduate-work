import { openModal } from './components/modals/modals.js';
import { txtConvertor } from './services/convertors/txt-convertor/txt-convertor.js';
import { initSidebarControl } from './services/sidebar-control/sidebar-control.js';
import { drawPrimitivesByType } from './services/draw-pcb/draw-pcb.js';
import { initZoomImageControl } from './services/zoom-image-control/zoom-image-control.js';
import { initUploadAreaControl } from './services/upload-area-contorl/upload-area-control.js';
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

const getPCBInformation = (primitives, size) => {
    if (primitives && size) {
        const statisticsData = {
            layersCount: new Set(),
            primitivesCount: 0,
            size: {
                height: 0,
                width: 0
            },
            layers: {}
        };

        primitives.reduce((result, current) => {
            if (current.layer !== 7) {
                result.layersCount.add(current.layer);

                result.primitivesCount += 1;

                result.layers[current.layer] = (result.layers[current.layer] || 0) + 1
            }

            return result;
        }, statisticsData);

        statisticsData.layersCount = statisticsData.layersCount.size;
        statisticsData.size = size;

        return statisticsData;
    } else {
        return null;
    }
};

const getStatisticHtml = data => {
    const LAYER_NAMES = {
        1: 'Верх мідь',
        2: 'Верхнє маркування',
        3: 'Низ мідь',
        4: 'Нижнє маркування',
        5: 'Внутрішній шар 1',
        6: 'Внутрішній шар 2',
        7: 'Контур плати'
    };

    if (data) {
        return `
            <h2>Інформація про плату</h2>
            <p>Загальна кількість PCB-об'єктів: <b>${data.primitivesCount} шт.</b></p>
            <h4>Плата містить такі шари:</h4>
            ${Object.keys(data.layers)
                .map(layer => `<p>Шар "${LAYER_NAMES[layer]}" (Містить PCB-об'єктів: <b>${data.layers[layer]} шт.</b>)</p>`).join('')}  
            <h4>Розмір плати:</h4>  
            <p>Висота: <b>${data.size.height} мм</b></p>
            <p>Ширина: <b>${data.size.width} мм</b></p>
        `
    } else {
        return `
            <h2>Інформація про плату</h2>
            <p>Загальна кількість PCB-об'єктів: 0</p>
            <h4>Плата містить такі шари:</h4>
            <p>Файл не обрано</p> 
            <h4>Розмір плати:</h4>  
            <p>Файл не обрано</p> 
        `
    }
};

FILE_INPUT.addEventListener('change', event => {
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

                                PCB_INFORMATION.innerHTML = getStatisticHtml(data ?
                                    getPCBInformation(convertedData, mainTabData.size) :
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
});

export {
    mainTabData,
}
