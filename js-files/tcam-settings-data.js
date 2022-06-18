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

const LAYERS = {
    'bottom': 3,
    'top': 1
}

const tcamSettingsData = {
    size: {
        height: 0,
        width: 0
    },
    offsetPrimitives: [],
    leftZoneValue: 'none',
    rightZoneValue: 'none',
    reflection: true,
    selectedMaterial: getTechnicalSettingsData().materials[0]
}

const setCostsData = () => {
    const { totalCost, taxPaymentsCost, printingCost } = calcTotalSum(
        mainTabData.size,
        tcamSettingsData.selectedMaterial.cost,
        TIME_CELL.textContent
    );

    PRINTING_COST_CELL.textContent = printingCost;
    TAX_PAYMENTS_CELL.textContent = taxPaymentsCost;
    TOTAL_COST_CELL.textContent = totalCost;
};

const calcTimeAndLength = (primitives) => {
    console.log(primitives)

    const contourCount = 3;

    let time = 0;
    let fullLength = 0;
    let lastPointOfPrimitive;

    const calcDistanceBetweenPoints = (firstPoint, secondPoint) => {
        return Math.sqrt(Math.pow(firstPoint.x - secondPoint.x, 2) + Math.pow(firstPoint.y - secondPoint.y, 2));
    }

    primitives.forEach((primitive, index) => {
        let length = 0;
        let prevPoint = { ...primitive.points[0] };

        if (lastPointOfPrimitive) {
            time += ((calcDistanceBetweenPoints(lastPointOfPrimitive, prevPoint) / (+POSITIONING_SPEED_INPUT.value / 60)) + +PAUSE_INPUT.value) * contourCount;
        }

        for (let i = 1; i < primitive.points.length; i++) {
            const currentPoint = { ...primitive.points[i] };
            length += calcDistanceBetweenPoints(prevPoint, currentPoint);
            prevPoint = { ...currentPoint };
        }

        time += ((length * contourCount) / (+ILLUMINATION_SPEED_INPUT.value / 60));
        fullLength += length * contourCount;
        lastPointOfPrimitive = prevPoint;
    });

    return {
        time: +time.toFixed(3),
        length: +(fullLength / 1000).toFixed(2)
    };
}

const recalculateManufacturingData = () => {
    let primitives = [];
    tcamSettingsData.size = { ...mainTabData.size };

    if (tcamSettingsData.leftZoneValue !== 'none') {
        [ ...mainTabData.pcbPrimitives ]
            .forEach(primitive => {
                if (primitive.layer === LAYERS[tcamSettingsData.leftZoneValue]) {
                    primitives.push(primitive);
                }
            });
    }
    if (tcamSettingsData.rightZoneValue !== 'none') {
        tcamSettingsData.size.width = mainTabData.size.width * 2;

        [ ...mainTabData.pcbPrimitives ]
            .forEach(primitive => {
                if (primitive.layer === LAYERS[tcamSettingsData.rightZoneValue]) {
                    if (tcamSettingsData.reflection) {
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
        setManufacturingTableData();
    });
}

const setManufacturingTableData = () => {
    const { time, length } = calcTimeAndLength(tcamSettingsData.offsetPrimitives);

    LENGTH_CELL.textContent = length;
    TIME_CELL.textContent = time;

    setCostsData();
}

LEFT_ZONE_SELECT.addEventListener('change', event => {
    tcamSettingsData.leftZoneValue = event.target.value;
    recalculateManufacturingData();
});

RIGHT_ZONE_SELECT.addEventListener('change', event => {
    tcamSettingsData.rightZoneValue = event.target.value;
    recalculateManufacturingData();
});

REFLECTION_BUTTON.addEventListener('click', () => {
    REFLECTION_BUTTON.classList.toggle('technical-scheme__reflection-button_disabled');
    tcamSettingsData.reflection = !REFLECTION_BUTTON.classList.contains('technical-scheme__reflection-button_disabled');
    recalculateManufacturingData();
});

MATERIAL_SELECT.addEventListener('change', event => {
    tcamSettingsData.selectedMaterial = getTechnicalSettingsData().materials.find(item => item.type === event.target.value);
    setCostsData();
});

initInputDebounce(QUALITY_INPUT, recalculateManufacturingData);
initInputDebounce(SPON_APERTURE_INPUT, recalculateManufacturingData);
initInputDebounce(ILLUMINATION_SPEED_INPUT, setManufacturingTableData);
initInputDebounce(POSITIONING_SPEED_INPUT, setManufacturingTableData);
initInputDebounce(PAUSE_INPUT, setManufacturingTableData);

export {
    tcamSettingsData
}
