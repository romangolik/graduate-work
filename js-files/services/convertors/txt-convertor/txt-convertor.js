import { PCB_PRIMITIVES } from '../_data/pcb-primitives.js';

const setLayer = (obj, value) => {
    const parsedValue = +value;

    if (isNaN(parsedValue) || (parsedValue < 1 || parsedValue > 7)) {
        throw 'Некоректні дані для шару примітива';
    }

    obj.layer = parsedValue;
}

const setPoints = (obj, value) => {
    let [ x, y ] = value.split('/');
    const parsedX = x === '' ? NaN : +x / 10000;
    const parsedY = y === '' ? NaN : +y / 10000;

    if (isNaN(parsedX) || isNaN(parsedY)) {
        throw 'Некоректні дані координат';
    }

    if (obj.pos) {
        obj.pos.push({ x: parsedX, y: parsedY });
    } else {
        obj.pos = [ { x: parsedX, y: parsedY } ];
    }
}

const setProperties = (obj, value, name, parsingType) => {
    const parsedValue = PARSING_FUNCTIONS[parsingType](value, name);

    if (obj['properties']) {
        obj['properties'][name] = parsedValue;
    } else {
        obj['properties'] = {
            [name]: parsedValue
        }
    }
}

const parseNumber = (value, propertyName) => {
    const parsedValue = +value;

    if (isNaN(parsedValue)) {
        throw `Помилка парсингу значення ${propertyName} до типу числа`;
    }

    return parsedValue;
}

const PARSING_TYPES = {
    NUMBER: 1,
    BOOLEAN: 2,
    TEXT: 3,
    SIZE: 4
}

const PARSING_FUNCTIONS = {
    [PARSING_TYPES.NUMBER]: parseNumber,
    [PARSING_TYPES.BOOLEAN]: (value, propertyName) => {
        if (value !== 'true' && value === 'false') {
            throw `Помилка парсингу значення ${propertyName} до типу булевого значення`;
        }
        return Boolean(value);
    },
    [PARSING_TYPES.TEXT]: (value, propertyName) => value.replaceAll('|', ''),
    [PARSING_TYPES.SIZE]: (value, propertyName) => parseNumber(value, propertyName) / 10000,
}

const PCB_OBJECT_CONVERTORS = new Map([
    [ 'LAYER', setLayer ],
    [ '^(POS|[P][0-9]+)', setPoints ],
    [ 'SIZE', (...args) => setProperties(...args, 'size', PARSING_TYPES.SIZE) ],
    [ 'FORM', (...args) => setProperties(...args, 'form', PARSING_TYPES.NUMBER) ],
    [ 'DRILL', (...args) => setProperties(...args, 'drill', PARSING_TYPES.SIZE) ],
    [ 'WIDTH', (...args) => setProperties(...args, 'width', PARSING_TYPES.SIZE) ],
    [ 'HEIGHT', (...args) => setProperties(...args, 'height', PARSING_TYPES.SIZE) ],
    [ 'SIZE_X', (...args) => setProperties(...args, 'size_x', PARSING_TYPES.SIZE) ],
    [ 'SIZE_Y', (...args) => setProperties(...args, 'size_y', PARSING_TYPES.SIZE) ],
    [ 'VIA', (...args) => setProperties(...args, 'via', PARSING_TYPES.BOOLEAN) ],
    [ 'MIRROR_HORZ', (...args) => setProperties(...args, 'mirror_horz', PARSING_TYPES.BOOLEAN) ],
    [ 'MIRROR_VERT', (...args) => setProperties(...args, 'mirror_vert', PARSING_TYPES.BOOLEAN) ],
    [ 'TEXT', (...args) => setProperties(...args, 'text', PARSING_TYPES.TEXT) ],
    [ 'ROTATION', (...args) => setProperties(...args, 'rotation', PARSING_TYPES.NUMBER) ],
    [ 'SOLDERMASK', (...args) => setProperties(...args, 'soldermas', PARSING_TYPES.BOOLEAN) ]
]);

const getPCBObject = (string, index) => {
    const array = string.split(',');
    const type = array[0];
    array.splice(0, 1);
    let obj;
    if (PCB_PRIMITIVES[type]) {
        obj = {
            type: PCB_PRIMITIVES[type]
        };
        try {
            array.forEach(item => {
                let [ characteristic, value ] = item.split('=');

                if (value) {
                    for (const [ key, method ] of PCB_OBJECT_CONVERTORS) {
                        const regex = new RegExp(`${key}$`);

                        if (regex.test(characteristic)) {
                            method(obj, value);
                            break;
                        }
                    }
                }
            });
        } catch (errorMessage) {
            throw `${errorMessage} в рядку №${index}`
        }
    } else {
        throw `Некоректний тип примітиву в рядку №${index + 1}`;
    }

    return obj;
};

export const txtConvertor = data => {
    return new Promise(resolve => {
        resolve(data
            .replaceAll(/(\r\n|\n|\r)/gm, '')
            .split(';')
            .filter(item => item)
            .map((item, index) => getPCBObject(item, index))
        );
    });
}
