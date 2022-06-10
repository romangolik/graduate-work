import { openModal } from "../../components/modals/modals.js";
import { createElement } from "../create-template/svg/create-svg-element.js";
import { getOctagonVertices } from "../get-figures-vertices/get-figures-vertices.js";

import { MODAL_TYPES } from "../../components/modals/_data/modal-types.js";
import { PCB_PRIMITIVES } from "../convertors/_data/pcb-primitives.js";

const LAYER_COLORS = {
    1: '#1e6af9',
    2: '#ff0000',
    3: '#00ba00',
    4: '#e1d704',
    5: '#c27c14',
    6: '#eeb662',
    7: '#ffffff',
};
const VIA_COLOR = '#51e3fd';

const createPadTemplate = (data, drills) => {
    const radius = data.properties.size / 2;
    const drill_radius = data.properties.drill / 2;
    const { x, y } = data.pos[0];

    let pad;

    drills.push(
        createElement(
            'circle',
            {
                'r': drill_radius,
                'cx': +x,
                'cy': +y,
                'fill': 'black'
            })
    );

    if (data.properties.form === 1) {
        pad = createElement(
            'circle',
            {
                'r': radius,
                'cx': +x,
                'cy': +y,
                'fill': `${!data.properties?.via ? LAYER_COLORS[data.layer] : VIA_COLOR}`
            }
        );
    } else if (data.properties.form === 2) {
        pad = createElement(
            'polygon',
            {
                'fill': `${!data.properties?.via ? LAYER_COLORS[data.layer] : VIA_COLOR}`,
                'points': getOctagonVertices(radius, { x, y })
                    .map(({ x, y }) => `${x},${y}`)
                    .join(' ')
            }
        );
    } else if (data.properties.form === 3) {
        pad = createElement('rect',
            {
                'width': data.properties.size,
                'height': data.properties.size,
                'x': x - data.properties.size / 2,
                'y': y - data.properties.size / 2,
                'fill': `${!data.properties?.via ? LAYER_COLORS[data.layer] : VIA_COLOR}`
            }
        )
    }

    return pad;
}

const createSMDPadTemplate = data => {
    const width = data.properties.size_x;
    const height = data.properties.size_y;
    const { x, y } = data.pos[0];

    return createElement('rect', {
        'width': width,
        'height': height,
        'x': x - width / 2,
        'y': y - height / 2,
        'fill': `${LAYER_COLORS[data.layer] ? LAYER_COLORS[data.layer] : '#1e6af9'}`
    });
}

const createPolylineTemplate = data => {
    const polyline = createElement(
        'polyline',
        {
            'fill': 'transparent',
            'stroke-width': data.properties.width,
            'stroke': `${LAYER_COLORS[data.layer]}`,
            'stroke-linecap': 'round'
        }
    );

    const points = [];
    data.pos.forEach(item => {
        const { x, y } = item;
        points.push(`${x},${y}`);
    });
    polyline.setAttribute('points', points.join(' '));

    return polyline;
}

const createZONETemplate = data => {
    const ZONE = createPolylineTemplate(data);
    ZONE.setAttribute('fill', `${LAYER_COLORS[data.layer]}`);
    ZONE.setAttribute('stroke-width', 0);

    return ZONE;
}

const createTextTemplate = data => {
    let { x, y } = data.pos[0];
    let transformValue = 'scale(1, 1)';

    if (data.properties.mirror_horz) {
        x = x * -1;
        transformValue = 'scale(-1, 1)';
    } else if (data.properties.mirror_vert) {
        y = y * -1;
        transformValue = 'scale(1, -1)';
    }

    return createElement('text', {
        'textContent': data.properties.text,
        x,
        y,
        'font-size': data.properties.height,
        'fill': `${LAYER_COLORS[data.layer]}`,
        'transform': transformValue
    });
}

const createPCBObject = (pcbObjectTemplates, pcbObject, createFunction) => {
    let dataByLayer = pcbObjectTemplates[pcbObject.layer];
    if (dataByLayer) {
        let dataByType = dataByLayer[pcbObject.type];
        if (dataByType) {
            dataByType.push(createFunction(pcbObject));
        } else {
            dataByLayer[pcbObject.type] = [ createFunction(pcbObject) ]
        }
    } else {
        pcbObjectTemplates[pcbObject.layer] = {
            [pcbObject.type]: [ createFunction(pcbObject) ]
        }
    }

    return pcbObjectTemplates;
}

const setSvgSize = (svg, height, width) => {
    svg.setAttribute('height', height);
    svg.setAttribute('width', width.toString());
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
}

const calculateSvgSize = (outline) => {
    const xPoints = [];
    const yPoints = [];

    Array
        .from(outline.points)
        .forEach(({ x, y }) => {
            xPoints.push(x);
            yPoints.push(y);
        });

    const minX = Math.min(...xPoints);
    const maxX = Math.max(...xPoints);
    const minY = Math.min(...yPoints);
    const maxY = Math.max(...yPoints);

    return {
        height: maxY + minY,
        width: maxX + minX
    }
}

export const drawPrimitivesByType = pcbObjects => {
    let drills = [];

    const PCB_OBJECTS_TEMPLATE_FUNCTIONS = {
        [PCB_PRIMITIVES.PAD]: (data) => createPadTemplate(data, drills),
        [PCB_PRIMITIVES.TRACK]: createPolylineTemplate,
        [PCB_PRIMITIVES.SMDPAD]: createSMDPadTemplate,
        [PCB_PRIMITIVES.ZONE]: createZONETemplate,
        [PCB_PRIMITIVES.TEXT]: createTextTemplate
    }

    const PCB_OBJECTS_ORDER = [
        PCB_PRIMITIVES.TRACK,
        PCB_PRIMITIVES.ZONE,
        PCB_PRIMITIVES.PAD,
        PCB_PRIMITIVES.SMDPAD,
        PCB_PRIMITIVES.TEXT
    ];

    return new Promise(resolve => {
        const SVG = createElement('svg', {
            'style': 'background-color: black'
        });

        let pcbOutline;
        let PCB_OBJECT_TEMPLATES = {};

        for (const pcbObject of pcbObjects) {
            if (pcbObject.type === PCB_PRIMITIVES.TRACK) {
                if (pcbObject.layer === 7) {
                    pcbOutline = createPolylineTemplate(pcbObject);
                    continue;
                }
            }
            PCB_OBJECT_TEMPLATES = createPCBObject(
                PCB_OBJECT_TEMPLATES,
                pcbObject,
                PCB_OBJECTS_TEMPLATE_FUNCTIONS[pcbObject.type]
            );
        }

        Object
            .keys(PCB_OBJECT_TEMPLATES)
            .sort((a, b) => a - b)
            .forEach(layer => {
                PCB_OBJECTS_ORDER.forEach(orderObject => {
                    if (PCB_OBJECT_TEMPLATES[layer][orderObject]) {
                        PCB_OBJECT_TEMPLATES[layer][orderObject].forEach(item => {
                            SVG.appendChild(item);
                        });
                    }
                });
            });

        drills.forEach(drill => {
            SVG.appendChild(drill);
        });

        if (pcbOutline) {
            SVG.appendChild(pcbOutline);

            const { height, width } = calculateSvgSize(pcbOutline);
            setSvgSize(SVG, height, width);

            resolve({
                image: SVG,
                size: {
                    height: +height.toFixed(3),
                    width: +width.toFixed(3)
                }
            });
        } else {
            openModal(MODAL_TYPES.SET_PCB_SIZE)
                .then(data => {
                    if (data) {
                        const { height, width } = data;
                        setSvgSize(SVG, height, width);

                        resolve({
                            image: SVG,
                            size: {
                                height,
                                width
                            }
                        });
                    } else {
                        resolve(null);
                    }
                });
        }
    });
}

export const drawPrimitivesByGCode = (gCodeStr, size) => {
    const fillProps = (obj, str, code, value) => {
        obj[code.toUpperCase()] = value.length ? parseFloat(value) : true;
        return '';
    }

    const convertCode = (code) => {
        let item = {};
        code.replace(/([gmxy])\s*([\-\d\.]+)/gi, fillProps.bind(null, item));

        return item;
    }

    return new Promise(resolve => {
        const SVG = createElement('svg', {
            'style': 'background-color: black'
        });
        setSvgSize(SVG, size.height, size.width);

        const result = (gCodeStr || '').toString()
            .replace('\r', '')
            .split('\n')
            .map(convertCode)
            .filter(item => item.X >= 0 || item.Y >= 0 || item.M === 5);

        let points = [];
        result.forEach(item => {
            if (item.M) {
                const polyline = createElement(
                    'polyline',
                    {
                        'fill': 'transparent',
                        'stroke-width': 0.05,
                        'stroke': `green`,
                    }
                );
                polyline.setAttribute('points', points.join(' '));
                SVG.appendChild(polyline);
                points = [];
            } else {
                points.push(`${item.X},${item.Y}`);
            }
        });

        resolve(SVG);
    });
}
