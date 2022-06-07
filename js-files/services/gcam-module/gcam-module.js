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

const offsetPolygon = (pts, offset, looped = false) => {
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
    let prevUpperPoint = {};
    let prevDownPoint = {};

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
            const lasDownPoint = downPoints[downPoints.length - 1];
            const lastUpperPoint = upperPoints[upperPoints.length - 1];

            downPoints.push(findLineIntersection(
                {
                    from: {
                        x: lasDownPoint.x,
                        y: lasDownPoint.y
                    },
                    to: {
                        x: prevDownPoint.x,
                        y: prevDownPoint.y
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
            ));
            upperPoints.push(findLineIntersection(
                {
                    from: {
                        x: lastUpperPoint.x,
                        y: lastUpperPoint.y
                    },
                    to: {
                        x: prevUpperPoint.x,
                        y: prevUpperPoint.y
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
            ))
        } else {
            downPoints.push({
                x: fixed(Xg1, 3),
                y: fixed(Yg1, 3)
            });
            upperPoints.push({
                x: fixed(Xo1, 3),
                y: fixed(Yo1, 3)
            });
        }

        prevDownPoint = {
            x: Xg2,
            y: Yg2
        };
        prevUpperPoint = {
            x: Xo2,
            y: Yo2
        }
    }

    downPoints.push({
        x: fixed(prevDownPoint.x, 3),
        y: fixed(prevDownPoint.y, 3),
    });

    upperPoints.push({
        x: fixed(prevUpperPoint.x, 3),
        y: fixed(prevUpperPoint.y, 3),
    });

    if (looped) {
        return upperPoints;
    }

    return [
        ...downPoints,
        ...upperPoints.reverse(),
        downPoints[0]
    ];
}

const offsetPad = (primitiveData, offsetValue) => {
    const size = primitiveData.properties.size;
    const halfSize = size / 2;

    if (primitiveData.properties.form === 1) {
        return getCircleVertices(halfSize + offsetValue, 30, primitiveData.pos[0]);
    } else if (primitiveData.properties.form === 2) {
        return getOctagonVertices(halfSize + offsetValue, primitiveData.pos[0]);
    } else if (primitiveData.properties.form === 3) {
        return offsetPolygon(
            getPolygonVertices(primitiveData.pos[0], size, size),
            offsetValue,
            true
        );
    }
}

const offsetSMDPad = (primitiveData, offsetValue) => {
    return offsetPolygon(
        getPolygonVertices(primitiveData.pos[0], primitiveData.properties.size_y, primitiveData.properties.size_x),
        offsetValue,
        true
    );
}

const offsetPolyline = (primitiveData, offsetValue) => {
    return offsetPolygon(primitiveData.pos, primitiveData.properties.width / 2 + offsetValue)
}

const offsetZone = (primitiveData, offsetValue) => {
    return offsetPolygon(primitiveData.pos, offsetValue, true);
}

const offsetPrimitiveFunc = {
    [PCB_PRIMITIVES.PAD]: offsetPad,
    [PCB_PRIMITIVES.SMDPAD]: offsetSMDPad,
    [PCB_PRIMITIVES.TRACK]: offsetPolyline,
    [PCB_PRIMITIVES.ZONE]: offsetZone
};

export const getOffsetPrimitives = (primitives, offsetValue) => {
    return primitives.map(primitive => ({
        type: primitive.type,
        pos: primitive.pos,
        properties: primitive.properties,
        points: offsetPrimitiveFunc[primitive.type](primitive, offsetValue / 2)
    }));
}
