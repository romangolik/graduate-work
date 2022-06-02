const getOffsetPrimitives = (primitives, offsetValue, count) => {
    const fixed = (number, a) => {
        return +((number).toFixed(a));
    }

    function findLineIntersection(line1, line2) {
        const x1 = line1.from.x;
        const y1 = line1.from.y;
        const x2 = line1.to.x;
        const y2 = line1.to.y;
        const x3 = line2.from.x;
        const y3 = line2.from.y;
        const x4 = line2.to.x;
        const y4 = line2.to.y;

        const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

        return {
            x: fixed(((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / den, 3),
            y: fixed(((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / den, 3)
        }
    }

    function offsetPolygon(pts, offset, looped = false) {
        if (looped) {
            const first = pts[0];
            const second = pts[1];
            const middle = {
                x: (first.x + second.x) / 2,
                y: (first.y + second.y) / 2,
            };
            pts[0] = middle;
            pts.push(middle);
        }

        let upperPoints = [];
        let downPoints = [];
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

            if (Object.keys(prevUpperPoint).length > 0) {
                const lastUpperPoint = upperPoints[upperPoints.length - 1];
                const lastDownPoint = downPoints[downPoints.length - 1];

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
                            x: Xg1,
                            y: Yg1
                        },
                        to: {
                            x: Xg2,
                            y: Yg2
                        }
                    }
                ));
                downPoints.push(findLineIntersection(
                    {
                        from: {
                            x: lastDownPoint.x,
                            y: lastDownPoint.y
                        },
                        to: {
                            x: prevDownPoint.x,
                            y: prevDownPoint.y
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
                upperPoints.push({
                    x: fixed(Xg1, 3),
                    y: fixed(Yg1, 3)
                });
                downPoints.push({
                    x: fixed(Xo1, 3),
                    y: fixed(Yo1, 3)
                });
            }

            prevUpperPoint = {
                x: Xg2,
                y: Yg2
            };
            prevDownPoint = {
                x: Xo2,
                y: Yo2
            }
        }

        upperPoints.push({
            x: fixed(prevUpperPoint.x, 3),
            y: fixed(prevUpperPoint.y, 3),
        });

        downPoints.push({
            x: fixed(prevDownPoint.x, 3),
            y: fixed(prevDownPoint.y, 3),
        });

        if (looped) {
            return upperPoints;
        }

        return [
            ...upperPoints,
            ...downPoints.reverse(),
            upperPoints[0]
        ];
    }

    const offsetCircle = (radius, numberOfPoints, centerPoint) => {
        const angleStep = (Math.PI * 2) / numberOfPoints;
        const points = [];

        for (let i = 1; i <= numberOfPoints; i++) {
            const x = centerPoint.x + Math.cos(i * angleStep) * radius;
            const y = centerPoint.y + Math.sin(i * angleStep) * radius;

            points.push({
                x: fixed(x, 3),
                y: fixed(y, 3)
            });
        }

        points.push(points[0]);

        return points;
    }

    const offsetPrimitives = {};
    let primitive;

    for (let i = 0; i < count; i++) {
        offsetPrimitives[i] = [];
    }

    primitives.forEach(item => {
        if (item.type === PCB_OBJECT_TYPES.PAD) {
            for (let i = 0; i < count; i++) {
                const a = item.pm.size / 2 + offsetValue / 2 + i * offsetValue;
                primitive = {
                    type: item.type,
                    pos: item.pos,
                    pm: item.pm,
                    points: offsetCircle(a, 30, item.pos[0])
                };
                offsetPrimitives[i].push(primitive);
            }
        }
        if (item.type === PCB_OBJECT_TYPES.TRACK) {
            for (let i = 0; i < count; i++) {
                const a = item.pm.width / 2 + offsetValue / 2 + i * offsetValue;
                primitive = {
                    type: item.type,
                    pos: item.pos,
                    pm: item.pm,
                    points: offsetPolygon(item.pos, a)
                };
                offsetPrimitives[i].push(primitive);
            }
        }
        if (item.type === PCB_OBJECT_TYPES.SMDPAD) {
            for (let i = 0; i < count; i++) {
                const { x, y } = item.pos[0];
                const width = item.pm.size_x / 2 + offsetValue / 2 + i * offsetValue;
                const height = item.pm.size_y / 2 + offsetValue / 2 + i * offsetValue;
                primitive = {
                    type: item.type,
                    pos: item.pos,
                    pm: item.pm,
                    points: [
                        { x: x - width, y: y + height },
                        { x: x + width, y: y + height },
                        { x: x + width, y: y - height },
                        { x: x - width, y: y - height },
                        { x: x - width, y: y + height },
                    ]
                };
                offsetPrimitives[i].push(primitive);
            }
        }
        if (item.type === PCB_OBJECT_TYPES.ZONE) {
            for (let i = 0; i < count; i++) {
                const a = offsetValue / 2 + i * offsetValue;
                primitive = {
                    type: item.type,
                    pos: item.pos,
                    pm: item.pm,
                    points: offsetPolygon(item.pos, a, true)
                };
                offsetPrimitives[i].push(primitive);
            }
        }
    });

    return offsetPrimitives;
}
