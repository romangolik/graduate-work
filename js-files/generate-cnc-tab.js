import { openModal } from "./components/modals/modals.js";
import { generateGCode } from "./services/gcode-generator/gcode-generator.js";
import { initScrollOnGrab } from "./services/scroll-on-grab/scroll-on-grab.js";
import { drawPrimitivesByGCode } from "./services/draw-pcb/draw-pcb.js";
import { showProgressBar, hideProgressBar } from "./components/progress-bar/progress-bar.js";

import { mainTabData } from "./main.js";
import { MODAL_TYPES } from "./components/modals/_data/modal-types.js";

const GCODE_PCB_WRAPPER = document.getElementById('gcode-pcb');
const GCODE_SCALING_SELECT = document.getElementById('gcode-scaling-select');

const DEFAULT_SCALE = 1;
const IMAGE_SIZE_MULTIPLICITY = 10;

const generateCNCTabData = {
    image: null,
    cncFile: null
}

let selectedLayer = 3;

initScrollOnGrab(GCODE_PCB_WRAPPER);

document.getElementById('psb-layer')
    .addEventListener('change', event => {
        selectedLayer = +event.target.value;
    });

document.getElementById('generateCNC')
    .addEventListener('click', () => {
        showProgressBar();
        const primitives = mainTabData.pcbPrimitives.filter(primitive => primitive.layer === selectedLayer);
        if (primitives.length) {
            generateGCode(primitives)
                .then(data => {
                    if (generateCNCTabData.image) {
                        generateCNCTabData.image.remove();
                    }
                    generateCNCTabData.cncFile = data;
                    drawPrimitivesByGCode(generateCNCTabData.cncFile, mainTabData.size, IMAGE_SIZE_MULTIPLICITY)
                        .then(data => {
                            generateCNCTabData.image = data;
                            GCODE_PCB_WRAPPER.appendChild(generateCNCTabData.image);
                        });
                    GCODE_SCALING_SELECT.value = DEFAULT_SCALE;
                    hideProgressBar();
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

GCODE_SCALING_SELECT.addEventListener('change', event => {
    const value = +event.target.value;
    const { width, height } = mainTabData.size;
    generateCNCTabData.image.setAttribute('width', `${width * value * IMAGE_SIZE_MULTIPLICITY}`);
    generateCNCTabData.image.setAttribute('height', `${height * value * IMAGE_SIZE_MULTIPLICITY}`);
});
