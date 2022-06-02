const GCODE_PCB_WRAPPER = document.getElementById('gcode-pcb');
const GCODE_SCALING_SELECT = document.getElementById('gcode-scaling-select');

let pcbSvg;
let cncFile;
let selectedLayer = 3;

initScrollOnGrab(GCODE_PCB_WRAPPER);

document.getElementById('psb-layer')
    .addEventListener('change', event => {
        selectedLayer = +event.target.value;
    });

document.getElementById('generateCNC')
    .addEventListener('click', () => {
        showProgressBar();
        const primitives = pcbObjects.filter(primitive => primitive.layer === selectedLayer);
        if (primitives.length) {
            generateCNCFile(primitives)
                .then(data => {
                    if (pcbSvg) {
                        pcbSvg.remove();
                    }
                    cncFile = data;
                    drawGCode(cncFile);
                    GCODE_SCALING_SELECT.value = DEFAULT_SCALE;
                    hideProgressBar();
                });
        } else {
            openModal(MODALS.ERROR_MESSAGE, {
                heading: 'Помилка генерування',
                text: `Для даного шару примітивів немає`
            }).then();
            hideProgressBar();
        }
    });

document.getElementById('download')
    .addEventListener('click', () => {
        if (cncFile) {
            const element = document.createElement('a');

            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(cncFile));
            element.setAttribute('download', 'test.txt');

            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
            cncFile = null;
        }
    });



function drawGCode(gCodeStr) {
    function fillProps(obj, str, code, value) {
        obj[code.toUpperCase()] = value.length ? parseFloat(value) : true;
        return '';
    }

    function convertCode(code) {
        let item = {};
        code.replace(/([gmxy])\s*([\-\d\.]+)/gi, fillProps.bind(null, item));

        return item;
    }

    pcbSvg = createElement('svg', {
        height: `${pcbHeight * IMAGE_SIZE_MULTIPLICITY}`,
        viewBox: `0 0 ${pcbWidth} ${pcbHeight}`,
        'style': 'background-color: black'
    });

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
            pcbSvg.appendChild(polyline);
            points = [];
        } else {
            points.push(`${item.X},${item.Y}`);
        }
    });
    GCODE_PCB_WRAPPER.appendChild(pcbSvg);
}

GCODE_SCALING_SELECT.addEventListener('change', event => {
    const value = +event.target.value;
    const { width, height } = pcbSvg.viewBox.baseVal;
    pcbSvg.setAttribute('width', `${width * value * IMAGE_SIZE_MULTIPLICITY}`);
    pcbSvg.setAttribute('height', `${height * value * IMAGE_SIZE_MULTIPLICITY}`);
});
