import { getOffsetPrimitives } from "../gcam-module/gcam-module.js";

export const generateGCode = (primitives) => {
    const lines = [];
    let lightingSpeed;
    let positionSpeed;

    const addStartFile = () => {
        lines.push('%FileName%');
        lines.push('G17');
        lines.push('G21');
        lines.push('G54');
        lines.push('G90');
        lines.push('M08');
    }

    const readSettings = () => {
        lightingSpeed = document.getElementById('lightingSpeed').value;
        positionSpeed = document.getElementById('positionSpeed').value;
    }

    const addEnd = () => {
        lines.push('M09');
        lines.push('M02');
    }

    readSettings();
    addStartFile();

    primitives = getOffsetPrimitives(primitives, 0.2);

    primitives.forEach(primitive => {
        primitive.points.forEach(({x, y}, index) => {
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

    return new Promise(resolve => resolve(lines.join('\r\n')));
}
