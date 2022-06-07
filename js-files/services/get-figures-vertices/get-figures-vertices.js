export const getPolygonVertices = (centerPoint, height, width) => {
    const { x, y } = centerPoint;
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    return [
        { x: x - halfWidth, y: y - halfHeight },
        { x: x + halfWidth, y: y - halfHeight },
        { x: x + halfWidth, y: y + halfHeight },
        { x: x - halfWidth, y: y + halfHeight },
        { x: x - halfWidth, y: y - halfHeight },
    ];
}

export const getCircleVertices = (radius, numberOfPoints, centerPoint) => {
    const points = [];
    const angleStep = (Math.PI * 2) / numberOfPoints;

    for (let i = 1; i <= numberOfPoints; i++) {
        const x = centerPoint.x + Math.cos(i * angleStep + angleStep / 2) * radius;
        const y = centerPoint.y + Math.sin(i * angleStep + angleStep / 2) * radius;

        points.push({
            x: +x.toFixed(3),
            y: +y.toFixed(3)
        });
    }

    points.push(points[0]);

    return points;
}

export const getOctagonVertices = (radius, centerPoint) => {
    const numberOfPoints = 8;
    return getCircleVertices(radius / Math.cos(Math.PI / numberOfPoints), numberOfPoints, centerPoint);
}
