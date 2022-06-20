import { offsetPad, offsetPolyline, offsetSMDPad } from '../gcam-module/gcam-module.js';

import { PCB_PRIMITIVES } from '../convertors/_data/pcb-primitives.js';


const tcamOffsetPad = (primitive, apertureValue, quality, inside = true) => {
    const size = primitive.properties.size / 2;
    const halfApertureSize = apertureValue / 2;
    const shiftValue = apertureValue * (1.2 - quality / 100);
    let contourCount = Math.ceil((size - halfApertureSize) / shiftValue);

    const result = [ offsetPad(primitive, halfApertureSize, inside) ];
    for (let i = 1; i < contourCount; i++) {
        result.push(offsetPad(primitive, halfApertureSize + shiftValue * i, inside));
    }

    return result;
}

const tcamOffsetPolyline = (primitive, apertureValue, quality, inside = true) => {
    const size = primitive.properties.width / 2;
    const halfApertureSize = apertureValue / 2;
    const shiftValue = apertureValue * (1.2 - quality / 100);
    let contourCount = Math.ceil((size - halfApertureSize) / shiftValue);

    const result = [ offsetPolyline(primitive, halfApertureSize, inside) ];
    for (let i = 0; i < contourCount; i++) {
        result.push(offsetPolyline(primitive, halfApertureSize + shiftValue * (i + 1), inside));
    }

    return result;
}

const tcamOffsetSMDPad = (primitive, apertureValue, quality, inside = true) => {
    const size = Math.min(primitive.properties.size_x, primitive.properties.size_y) / 2;
    const halfApertureSize = apertureValue / 2;
    const shiftValue = apertureValue * (1.2 - quality / 100);
    let contourCount = Math.ceil((size - apertureValue) / shiftValue);

    const result = [ offsetSMDPad(primitive, halfApertureSize, inside) ];
    for (let i = 0; i < contourCount; i++) {
        result.push(offsetSMDPad(primitive, halfApertureSize + shiftValue * (i + 1), inside));
    }

    return result;
}

const offsetPrimitiveFunc = {
    [PCB_PRIMITIVES.PAD]: tcamOffsetPad,
    [PCB_PRIMITIVES.SMDPAD]: tcamOffsetSMDPad,
    [PCB_PRIMITIVES.TRACK]: tcamOffsetPolyline,
};

export const tcamModule = (primitives, apertureValue, quality) => {
    return new Promise(resolve => {
        const result = [];
        primitives.forEach(primitive => {
            if (offsetPrimitiveFunc[primitive.type]) {
                const offsetPrimitives = offsetPrimitiveFunc[primitive.type](primitive, apertureValue, quality, true);
                offsetPrimitives.forEach(offsetPrimitive => {
                    result.push({
                        type: primitive.type,
                        pos: primitive.pos,
                        properties: primitive.properties,
                        points: offsetPrimitive
                    });
                });
            }
        });
        resolve(result);
    });
}
