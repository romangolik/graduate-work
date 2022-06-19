import {
    initTechModeData,
    initMaterialSelect,
    getTechnicalSettingsData,
} from './services/config-control/config-control.js';
import { calcTotalSum } from './services/cost-calc/cost-calc.js';
import { initInputDebounce } from './services/input-debounce/input-debounce.js';
import { getOffsetPrimitives } from './services/gcam-module/gcam-module.js';

import { mainTabData } from './main.js';

initMaterialSelect();
initTechModeData();

const LEFT_ZONE_SELECT = document.getElementById('left-zone');
const RIGHT_ZONE_SELECT = document.getElementById('right-zone');
const REFLECTION_BUTTON = document.getElementById('reflection-button');

const LIMITS_PCB_CHECKBOX = document.getElementById('limits-pcb');
const VIEW_PCB_CHECKBOX = document.getElementById('view-pcb');

const MATERIAL_SELECT = document.getElementById('material');

const LENGTH_CELL = document.getElementById('length-cell');
const TIME_CELL = document.getElementById('time-cell');
const PRINTING_COST_CELL = document.getElementById('printing-cost-cell');
const TAX_PAYMENTS_CELL = document.getElementById('tax-payments-cell');
const TOTAL_COST_CELL = document.getElementById('total-cost-cell');

const QUALITY_INPUT = document.getElementById('quality');
const SPON_APERTURE_INPUT = document.getElementById('spon-aperture');

const ILLUMINATION_SPEED_INPUT = document.getElementById('illumination-speed');
const POSITIONING_SPEED_INPUT = document.getElementById('positioning-speed');
const PAUSE_INPUT = document.getElementById('pause');

const TRANSFER_TO_PCB_CHECKBOX = document.getElementById('transfer-to-pcb');

const LAYERS = {
    'bottom': 3,
    'top': 1
};

const technicalSettingsData = getTechnicalSettingsData();

const DEFAULT_TCAM_SETTINGS_DATA = {
    size: {
        height: 0,
        width: 0
    },
    offsetPrimitives: [],
    transferToPcb: technicalSettingsData.inset_to_cnc_options.transfer_to_PCB,
    technologicalScheme: {
        leftZone: 'none',
        rightZone: 'none',
        reflection: true,
        limitsPcb: technicalSettingsData.inset_to_cnc_options.limits_PCB,
        viewPcb: technicalSettingsData.inset_to_cnc_options.view_PCB,
    },
    manufacturingParams: {
        material: technicalSettingsData.materials[0],
        length: 0,
        time: 0,
        printingCost: 0,
        taxPayments: 0,
        totalCost: 0
    },
    processParams: {
        quality: technicalSettingsData.tech_mode.quality,
        spon_aperture: technicalSettingsData.tech_mode.spon_aperture,
        emission_power: technicalSettingsData.tech_mode.emission_power,
        F0: technicalSettingsData.tech_mode.F0,
        F1: technicalSettingsData.tech_mode.F1,
        wait_run: technicalSettingsData.tech_mode.wait_run
    }
};

const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
}

const setCostsData = () => {
    const { totalCost, taxPayments, printingCost } = calcTotalSum(
        mainTabData.size,
        tcamSettingsData.manufacturingParams.material.cost,
        TIME_CELL.textContent
    );

    tcamSettingsData.manufacturingParams = {
        ...tcamSettingsData.manufacturingParams,
        printingCost,
        taxPayments,
        totalCost
    }

    PRINTING_COST_CELL.textContent = printingCost;
    TAX_PAYMENTS_CELL.textContent = taxPayments;
    TOTAL_COST_CELL.textContent = totalCost;
};

const calcTimeAndLength = (primitives) => {
    const { F0, F1, wait_run, spon_aperture, quality } = tcamSettingsData.processParams;

    let time = 0;
    let fullLength = 0;
    let lastPointOfPrimitive;

    const calcDistanceBetweenPoints = (firstPoint, secondPoint) => {
        return Math.sqrt(Math.pow(firstPoint.x - secondPoint.x, 2) + Math.pow(firstPoint.y - secondPoint.y, 2));
    }

    primitives.forEach(primitive => {
        let length = 0;
        let contourCount = 3;
        //let contourCount = spon_aperture * (1.2 - quality / 100);
        let prevPoint = { ...primitive.points[0] };

        if (lastPointOfPrimitive) {
            time += ((calcDistanceBetweenPoints(lastPointOfPrimitive, prevPoint) / (+F0 / 60)) + +wait_run) * contourCount;
        }

        for (let i = 1; i < primitive.points.length; i++) {
            const currentPoint = { ...primitive.points[i] };
            length += calcDistanceBetweenPoints(prevPoint, currentPoint);
            prevPoint = { ...currentPoint };
        }

        time += ((length * contourCount) / (+F1 / 60));
        fullLength += length * contourCount;
        lastPointOfPrimitive = prevPoint;
    });

    tcamSettingsData.manufacturingParams.time = +time.toFixed(3);
    tcamSettingsData.manufacturingParams.length = +(fullLength / 1000).toFixed(2);
}

const recalculateManufacturingData = () => {
    let primitives = [];
    let contourPrimitive;
    let limitsPcb = [];
    tcamSettingsData.size = { ...mainTabData.size };

    if (tcamSettingsData.technologicalScheme.limitsPcb) {
        contourPrimitive = [ ...mainTabData.pcbPrimitives ].find(primitive => primitive.layer === 7);
    }

    if (tcamSettingsData.technologicalScheme.leftZone !== 'none') {
        if (contourPrimitive) {
            limitsPcb.push({
                ...contourPrimitive,
                points: contourPrimitive.pos
            });
        }
        [ ...mainTabData.pcbPrimitives ]
            .forEach(primitive => {
                if (primitive.layer === LAYERS[tcamSettingsData.technologicalScheme.leftZone]) {
                    primitives.push(primitive);
                }
            });
    }
    if (tcamSettingsData.technologicalScheme.rightZone !== 'none') {
        tcamSettingsData.size.width = mainTabData.size.width * 2;

        if (contourPrimitive) {
            limitsPcb.push({
                ...contourPrimitive,
                points: contourPrimitive.pos.map(({ x, y }) => ({ x: mainTabData.size.width + x, y }))
            });
        }

        [ ...mainTabData.pcbPrimitives ]
            .forEach(primitive => {
                if (primitive.layer === LAYERS[tcamSettingsData.technologicalScheme.rightZone]) {
                    if (tcamSettingsData.technologicalScheme.reflection) {
                        primitives.push({
                            ...primitive,
                            pos: primitive.pos.map(({ x, y }) => ({ x: 2 * mainTabData.size.width + (x * -1), y }))
                        });
                    } else {
                        primitives.push({
                            ...primitive,
                            pos: primitive.pos.map(({ x, y }) => ({ x: mainTabData.size.width + x, y }))
                        });
                    }
                }
            });
    }

    getOffsetPrimitives(
        primitives,
        +SPON_APERTURE_INPUT.value
    ).then(data => {
        tcamSettingsData.offsetPrimitives = data;
        tcamSettingsData.offsetPrimitives.unshift(...limitsPcb);
        setManufacturingTableData();
    });
}

const setManufacturingTableData = () => {
    calcTimeAndLength(tcamSettingsData.offsetPrimitives);
    const { time, length } = tcamSettingsData.manufacturingParams;

    LENGTH_CELL.textContent = length;
    TIME_CELL.textContent = time;

    setCostsData();
}

const resetTechnologicalScheme = () => {
    const {
        leftZone,
        rightZone,
        reflection,
        limitsPcb,
        viewPcb
    } = tcamSettingsData.technologicalScheme;

    LEFT_ZONE_SELECT.value = leftZone;
    RIGHT_ZONE_SELECT.value = rightZone;
    REFLECTION_BUTTON.classList.toggle('technical-scheme__reflection-button_disabled', !reflection);
    LIMITS_PCB_CHECKBOX.checked = limitsPcb;
    VIEW_PCB_CHECKBOX.checked = viewPcb;
}

const resetManufacturingData = () => {
    const {
        material,
        length,
        time,
        printingCost,
        taxPayments,
        totalCost
    } = tcamSettingsData.manufacturingParams;

    MATERIAL_SELECT.value = material.type;
    LENGTH_CELL.textContent = length;
    TIME_CELL.textContent = time;
    PRINTING_COST_CELL.textContent = printingCost;
    TAX_PAYMENTS_CELL.textContent = taxPayments;
    TOTAL_COST_CELL.textContent = totalCost;
}

const resetTcamSettingsData = () => {
    tcamSettingsData = deepClone(DEFAULT_TCAM_SETTINGS_DATA);

    resetTechnologicalScheme();
    resetManufacturingData();

    TRANSFER_TO_PCB_CHECKBOX.checked = tcamSettingsData.transferToPcb;
}

let tcamSettingsData = deepClone(DEFAULT_TCAM_SETTINGS_DATA);

LIMITS_PCB_CHECKBOX.checked = tcamSettingsData.technologicalScheme.limitsPcb;
VIEW_PCB_CHECKBOX.checked = tcamSettingsData.technologicalScheme.viewPcb;
TRANSFER_TO_PCB_CHECKBOX.checked = tcamSettingsData.transferToPcb;

LEFT_ZONE_SELECT.addEventListener('change', event => {
    tcamSettingsData.technologicalScheme.leftZone = event.target.value;
    recalculateManufacturingData();
});

RIGHT_ZONE_SELECT.addEventListener('change', event => {
    tcamSettingsData.technologicalScheme.rightZone = event.target.value;
    recalculateManufacturingData();
});

REFLECTION_BUTTON.addEventListener('click', () => {
    REFLECTION_BUTTON.classList.toggle('technical-scheme__reflection-button_disabled');
    tcamSettingsData.technologicalScheme.reflection =
        !REFLECTION_BUTTON.classList.contains('technical-scheme__reflection-button_disabled');
    recalculateManufacturingData();
});

LIMITS_PCB_CHECKBOX.addEventListener('change', event => {
    tcamSettingsData.technologicalScheme.limitsPcb = event.target.checked;
    recalculateManufacturingData();
});

VIEW_PCB_CHECKBOX.addEventListener('change', event => {
    tcamSettingsData.technologicalScheme.viewPcb = event.target.checked;
    recalculateManufacturingData();
});

TRANSFER_TO_PCB_CHECKBOX.addEventListener('change', event => {
    tcamSettingsData.transferToPcb = event.target.checked;
    recalculateManufacturingData();
});

MATERIAL_SELECT.addEventListener('change', event => {
    tcamSettingsData.manufacturingParams.material =
        getTechnicalSettingsData().materials.find(item => item.type === event.target.value);
    setCostsData();
});

initInputDebounce(QUALITY_INPUT, event => {
    tcamSettingsData.processParams.quality = +event.target.value;
    setManufacturingTableData();
});
initInputDebounce(SPON_APERTURE_INPUT, event => {
    tcamSettingsData.processParams.spon_aperture = +event.target.value;
    setManufacturingTableData();
});
initInputDebounce(ILLUMINATION_SPEED_INPUT, event => {
    tcamSettingsData.processParams.F1 = +event.target.value;
    setManufacturingTableData();
});
initInputDebounce(POSITIONING_SPEED_INPUT, event => {
    tcamSettingsData.processParams.F0 = +event.target.value;
    setManufacturingTableData();
});
initInputDebounce(PAUSE_INPUT, event => {
    tcamSettingsData.processParams.wait_run = +event.target.value;
    setManufacturingTableData();
});

export {
    tcamSettingsData,
    resetTcamSettingsData
}
