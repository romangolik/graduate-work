import { openModal } from "./components/modals/modals.js";
import { generateGCode } from "./services/gcode-generator/gcode-generator.js";
import { initZoomImageControl } from './services/zoom-image-control/zoom-image-control.js';
import { drawPrimitivesByGCode } from "./services/draw-pcb/draw-pcb.js";
import { showProgressBar, hideProgressBar } from "./components/progress-bar/progress-bar.js";

import { tcamSettingsData } from "./tcam-settings-data.js";
import { MODAL_TYPES } from "./components/modals/_data/modal-types.js";

const GCODE_VIEWER = document.getElementById('gcode-viewer');

const generateCNCTabData = {
    image: null,
    cncFile: null
}

let selectedLayer = 3;

const { IMAGE_WRAPPER, resetScalingSelectValue } = initZoomImageControl(
    'gcode-pcb',
    'gcode-scaling-select',
    (event, imageSizeMultiplicity) => {
        if (generateCNCTabData.image) {
            const value = +event.target.value;
            const { width, height } = tcamSettingsData.size;
            generateCNCTabData.image.setAttribute('width', `${width * value * imageSizeMultiplicity}`);
            generateCNCTabData.image.setAttribute('height', `${height * value * imageSizeMultiplicity}`);
        }
    }
);

document.getElementById('psb-layer')
    .addEventListener('change', event => {
        selectedLayer = +event.target.value;
    });

document.getElementById('generateCNC')
    .addEventListener('click', () => {
        showProgressBar();
        if (tcamSettingsData.offsetPrimitives.length) {
            generateGCode(tcamSettingsData.offsetPrimitives)
                .then(data => {
                    if (generateCNCTabData.image) {
                        generateCNCTabData.image.remove();
                    }
                    generateCNCTabData.cncFile = data;
                    GCODE_VIEWER.textContent = data;

                    drawPrimitivesByGCode(generateCNCTabData.cncFile, tcamSettingsData.size)
                        .then(data => {
                            generateCNCTabData.image = data;
                            IMAGE_WRAPPER.appendChild(generateCNCTabData.image);
                            resetScalingSelectValue();
                            hideProgressBar();
                        });
                });
        } else {
            openModal(MODAL_TYPES.ERROR_MESSAGE, {
                heading: 'Помилка генерування',
                text: `Для даного шару примітивів немає`
            }).then();
            hideProgressBar();
        }
    });

document.getElementById('download')
    .addEventListener('click', () => {
        if (generateCNCTabData.cncFile) {
            const element = document.createElement('a');

            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(generateCNCTabData.cncFile));
            element.setAttribute('download', 'test.txt');

            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
            generateCNCTabData.cncFile = null;
        }
    });
