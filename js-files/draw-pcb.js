const drawPCB = (pcbObjects, imageSizeMultiplicity) => {
    const LAYER_COLORS = {
        1: '#1e6af9',
        2: '#ff0000',
        3: '#00ba00',
        4: '#e1d704',
        5: '#c27c14',
        6: '#eeb662',
        7: '#ffffff',
    };

    const viaColor = '#51e3fd';

    let drills = [];

    const createOctagon = (radius, centerPoint) => {
        const numberOfPoints = 8;
        const angleStep = (Math.PI * 2) / numberOfPoints;
        const points = [];

        for (let i = 0; i < numberOfPoints; i++) {
            const x = centerPoint.x + Math.cos(i * angleStep + angleStep / 2) * radius;
            const y = centerPoint.y + Math.sin(i * angleStep + angleStep / 2) * radius;

            points.push({ x, y });
        }

        points.push(points[0]);

        return points;
    }

    const createPadTemplate = data => {
        const radius = data.pm.size / 2;
        const drill_radius = data.pm.drill / 2;
        const { x, y } = data.pos[0];
        let pad;

        drills.push(createElement(
            'circle',
            {
                'r': drill_radius,
                'cx': +x,
                'cy': +y,
                'fill': 'black'
            })
        );

        if (data.pm.form === 1) {
            pad = createElement(
                'circle',
                {
                    'r': radius,
                    'cx': +x,
                    'cy': +y,
                    'fill': `${!data.pm?.via ? LAYER_COLORS[data.layer] : viaColor}`
                });
        } else if (data.pm.form === 2) {
            pad = createElement('polygon', {
                'fill': `${!data.pm?.via ? LAYER_COLORS[data.layer] : viaColor}`,
                'points': createOctagon(radius, { x, y })
                    .map(({ x, y }) => `${x},${y}`)
                    .join(' ')
            });
        } else if (data.pm.form === 3) {
            pad = createElement('rect', {
                'width': data.pm.size,
                'height': data.pm.size,
                'x': x - data.pm.size / 2,
                'y': y - data.pm.size / 2,
                'fill': `${!data.pm?.via ? LAYER_COLORS[data.layer] : viaColor}`
            })
        }

        return pad;
    }

    const createSMDPadTemplate = data => {
        const width = data.pm.size_x;
        const height = data.pm.size_y;
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
                'stroke-width': data.pm.width,
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

        return ZONE;
    }

    const createTextTemplate = data => {
        let { x, y } = data.pos[0];
        let transformValue = 'scale(1, 1)';

        if (data.pm.mirror_horz) {
            x = x * -1;
            transformValue = 'scale(-1, 1)';
        } else if (data.pm.mirror_vert) {
            y = y * -1;
            transformValue = 'scale(1, -1)';
        }

        return createElement('text', {
            'textContent': data.pm.text,
            x,
            y,
            'font-size': data.pm.height,
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
        svg.setAttribute('height', (height * imageSizeMultiplicity).toString());
        svg.setAttribute('width', (width * imageSizeMultiplicity).toString());
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

    const PCB_OBJECTS_TEMPLATE_FUNCTIONS = {
        [PCB_OBJECT_TYPES.PAD]: createPadTemplate,
        [PCB_OBJECT_TYPES.TRACK]: createPolylineTemplate,
        [PCB_OBJECT_TYPES.SMDPAD]: createSMDPadTemplate,
        [PCB_OBJECT_TYPES.ZONE]: createZONETemplate,
        [PCB_OBJECT_TYPES.TEXT]: createTextTemplate
    }

    const PCB_OBJECTS_ORDER = [
        PCB_OBJECT_TYPES.TRACK,
        PCB_OBJECT_TYPES.ZONE,
        PCB_OBJECT_TYPES.PAD,
        PCB_OBJECT_TYPES.SMDPAD,
        PCB_OBJECT_TYPES.TEXT
    ];

    return new Promise(resolve => {
        const SVG = createElement('svg', {
            'style': 'background-color: black'
        });

        let pcbOutline;
        let PCB_OBJECT_TEMPLATES = {};

        for (const pcbObject of pcbObjects) {
            if (pcbObject.type === PCB_OBJECT_TYPES.TRACK) {
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
                    height,
                    width
                }
            });
        } else {
            openModal(MODALS.SET_PCB_SIZE)
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
