import {
    getCircleVertices,
    getOctagonVertices,
    getPolygonVertices
} from "../get-figures-vertices/get-figures-vertices.js";

import { PCB_PRIMITIVES } from "../convertors/_data/pcb-primitives.js";

const fixed = (number, a) => {
    return +((number).toFixed(a));
}

const isClockwise = (poly) => {
    let sum = 0;
    for (let i = 0; i < poly.length - 1; i++) {
        let cur = poly[i],
            next = poly[i + 1];
        sum += (next.x - cur.x) * (next.y + cur.y);
    }
    return sum < 0
}

const findLineIntersection = (line1, line2) => {
    const x1 = line1.from.x;
    const y1 = line1.from.y;
    const x2 = line1.to.x;
    const y2 = line1.to.y;
    const x3 = line2.from.x;
    const y3 = line2.from.y;
    const x4 = line2.to.x;
    const y4 = line2.to.y;

    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (den === 0) {
        return null;
    }

    return {
        x: fixed(((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / den, 3),
        y: fixed(((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / den, 3)
    }
}

const offsetPolygon = (pts, offset, looped = false, inside = true) => {
    if (looped) {
        const first = pts[0];
        const second = pts[1];
        const last = pts[pts.length - 1];
        const middle = {
            x: (first.x + second.x) / 2,
            y: (first.y + second.y) / 2,
        };
        if (!(first.x === last.x && first.y === last.y)) {
            pts.push(pts[0]);
        }
        pts[0] = middle;
        pts.push(middle);
        if (!isClockwise(pts)) {
            pts = pts.reverse();
        }
    }

    let downPoints = [];
    let upperPoints = [];

    for (let i = 1; i < pts.length; i++) {
        const prevPoint = pts[i - 1];
        const currentPoint = pts[i];

        const deltaX = fixed(currentPoint.x - prevPoint.x, 3);
        const deltaY = fixed(currentPoint.y - prevPoint.y, 3);

        const D = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const K = offset / D;

        const Xg1 = prevPoint.x - K * deltaY;
        const Yg1 = prevPoint.y + K * deltaX;
        const Xg2 = currentPoint.x - K * deltaY;
        const Yg2 = currentPoint.y + K * deltaX;

        const Xo1 = prevPoint.x + K * deltaY;
        const Yo1 = prevPoint.y - K * deltaX;
        const Xo2 = currentPoint.x + K * deltaY;
        const Yo2 = currentPoint.y - K * deltaX;

        if (i > 1) {
            const penultimateDownPoint = downPoints[downPoints.length - 2];
            const penultimateUpperPoint = upperPoints[upperPoints.length - 2];
            const lastDownPoint = downPoints[downPoints.length - 1];
            const lastUpperPoint = upperPoints[upperPoints.length - 1];

            const downPointsIntersection = findLineIntersection(
                {
                    from: {
                        x: lastDownPoint.x,
                        y: lastDownPoint.y
                    },
                    to: {
                        x: penultimateDownPoint.x,
                        y: penultimateDownPoint.y
                    }
                },
                {
                    from: {
                        x: Xg1,
                        y: Yg1
                    },
                    to: {
                        x: Xg2,
                        y: Yg2
                    }
                }
            );

            if (downPointsIntersection) {
                downPoints[downPoints.length - 1] = downPointsIntersection;
            } else {
                downPoints.splice(downPoints.length - 1, 1);
            }

            const upperPointsIntersection = findLineIntersection(
                {
                    from: {
                        x: lastUpperPoint.x,
                        y: lastUpperPoint.y
                    },
                    to: {
                        x: penultimateUpperPoint.x,
                        y: penultimateUpperPoint.y
                    }
                },
                {
                    from: {
                        x: Xo1,
                        y: Yo1
                    },
                    to: {
                        x: Xo2,
                        y: Yo2
                    }
                }
            );

            if (upperPointsIntersection) {
                upperPoints[upperPoints.length - 1] = upperPointsIntersection;
            } else {
                upperPoints.splice(upperPoints.length - 1, 1);
            }

            downPoints.push( {
                x: fixed(Xg2, 3),
                y: fixed(Yg2, 3),
            });
            upperPoints.push({
                x: fixed(Xo2, 3),
                y: fixed(Yo2, 3),
            });
        } else {
            downPoints.push({
                x: fixed(Xg1, 3),
                y: fixed(Yg1, 3)
            }, {
                x: fixed(Xg2, 3),
                y: fixed(Yg2, 3),
            });
            upperPoints.push({
                x: fixed(Xo1, 3),
                y: fixed(Yo1, 3)
            },{
                x: fixed(Xo2, 3),
                y: fixed(Yo2, 3),
            });
        }
    }

    if (looped) {
        return inside ? downPoints : upperPoints;
    }

    return [
        ...downPoints,
        ...upperPoints.reverse(),
        downPoints[0]
    ];
}

export const offsetPad = (primitiveData, offsetValue, inside = true) => {
    const size = primitiveData.properties.size;
    const halfSize = size / 2;

    if (primitiveData.properties.form === 1) {
        return getCircleVertices(halfSize + offsetValue * (inside ? -1 : 1), 30, primitiveData.pos[0]);
    } else if (primitiveData.properties.form === 2) {
        return getOctagonVertices(halfSize + offsetValue * (inside ? -1 : 1), primitiveData.pos[0]);
    } else if (primitiveData.properties.form === 3) {
        return offsetPolygon(
            getPolygonVertices(primitiveData.pos[0], size, size),
            offsetValue,
            true,
            inside
        );
    }
}

export const offsetSMDPad = (primitiveData, offsetValue, inside = true) => {
    return offsetPolygon(
        getPolygonVertices(primitiveData.pos[0], primitiveData.properties.size_y, primitiveData.properties.size_x),
        offsetValue,
        true,
        inside
    );
}

export const offsetPolyline = (primitiveData, offsetValue, inside = true) => {
    const halfWidth = primitiveData.properties.width / 2;
    if (halfWidth === offsetValue) {
        return [...primitiveData.pos];
    }
    return offsetPolygon([...primitiveData.pos], primitiveData.properties.width / 2 + offsetValue * (inside ? -1 : 1))
}

const offsetZone = (primitiveData, offsetValue, inside = true) => {
    return offsetPolygon([...primitiveData.pos], +offsetValue, true, inside);
}

const offsetPrimitiveFunc = {
    [PCB_PRIMITIVES.PAD]: offsetPad,
    [PCB_PRIMITIVES.SMDPAD]: offsetSMDPad,
    [PCB_PRIMITIVES.TRACK]: offsetPolyline,
    [PCB_PRIMITIVES.ZONE]: offsetZone
};

export const getOffsetPrimitives = async (primitives, offsetValue) => {
    return new Promise(resolve => {
       const result = primitives.map(primitive => ({
           type: primitive.type,
           pos: primitive.pos,
           properties: primitive.properties,
           points: offsetPrimitiveFunc[primitive.type](primitive, offsetValue / 2, true)
       }));
       resolve(result);
    });
}
