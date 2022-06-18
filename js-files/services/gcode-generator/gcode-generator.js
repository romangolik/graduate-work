export const generateGCode = (primitives) => {
    const lines = [];
    let lightingSpeed;
    let positionSpeed;

    const addStartFile = () => {
        lines.push('G17');
        lines.push('G21');
        lines.push('G54');
        lines.push('G90');
        lines.push('M08');
    }

    const readSettings = () => {
        lightingSpeed = 400;
        positionSpeed = 2000;
    }

    const addEnd = () => {
        lines.push('M09');
        lines.push('M02');
    }

    return new Promise(resolve => {
        readSettings();
        addStartFile();

        primitives.forEach(primitive => {
            primitive.points.forEach(({ x, y }, index) => {
                if (index === 0) {
                    lines.push(`G00 X${x.toFixed(3)} Y${y.toFixed(3)} F${positionSpeed}`);
                    lines.push('M03 G04 P0.5');
                } else {
                    lines.push(index === 1 ?
                        `G01 X${x.toFixed(3)} Y${y.toFixed(3)} F${lightingSpeed}` :
                        `X${x.toFixed(3)} Y${y.toFixed(3)}`);
                }
            });
            lines.push('M05');
        });

        addEnd();

        resolve(lines.join('\r\n'));
    });
}
