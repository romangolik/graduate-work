const PCB_OBJECT_TYPES = {
    'PAD': 1,
    'TRACK': 2,
    'SMDPAD': 3,
    'ZONE': 4,
    'TEXT': 5
}

const getPCBObjects = data => {
    const getLayer = (obj, value) => {
        const parsedValue = +value;

        if (isNaN(parsedValue) || (parsedValue < 1 || parsedValue > 7)) {
            throw 'Некоректні дані для шару примітива';
        }

        obj.layer = parsedValue;
    }

    const getPoints = (obj, value) => {
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

    const getPm = (obj, value, name, parsingType) => {
        const parsedValue = PARSING_FUNCTIONS[parsingType](value, name);

        if (obj['pm']) {
            obj['pm'][name] = parsedValue;
        } else {
            obj['pm'] = {
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
        [ 'LAYER', getLayer ],
        [ '^(POS|[P][0-9]+)', getPoints ],
        [ 'SIZE', (...args) => getPm(...args, 'size', PARSING_TYPES.SIZE) ],
        [ 'FORM', (...args) => getPm(...args, 'form', PARSING_TYPES.NUMBER) ],
        [ 'DRILL', (...args) => getPm(...args, 'drill', PARSING_TYPES.SIZE) ],
        [ 'WIDTH', (...args) => getPm(...args, 'width', PARSING_TYPES.SIZE) ],
        [ 'HEIGHT', (...args) => getPm(...args, 'height', PARSING_TYPES.SIZE) ],
        [ 'SIZE_X', (...args) => getPm(...args, 'size_x', PARSING_TYPES.SIZE) ],
        [ 'SIZE_Y', (...args) => getPm(...args, 'size_y', PARSING_TYPES.SIZE) ],
        [ 'VIA', (...args) => getPm(...args, 'via', PARSING_TYPES.BOOLEAN) ],
        [ 'MIRROR_HORZ', (...args) => getPm(...args, 'mirror_horz', PARSING_TYPES.BOOLEAN) ],
        [ 'MIRROR_VERT', (...args) => getPm(...args, 'mirror_vert', PARSING_TYPES.BOOLEAN) ],
        [ 'TEXT', (...args) => getPm(...args, 'text', PARSING_TYPES.TEXT) ],
        [ 'ROTATION', (...args) => getPm(...args, 'rotation', PARSING_TYPES.NUMBER) ],
        [ 'SOLDERMASK', (...args) => getPm(...args, 'soldermas', PARSING_TYPES.BOOLEAN) ]
    ]);

    const getPCBObject = (string, index) => {
        const array = string.split(',');
        const type = array[0];
        array.splice(0, 1);
        let obj;
        if (PCB_OBJECT_TYPES[type]) {
            obj = {
                type: PCB_OBJECT_TYPES[type]
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

    return data
        .replaceAll(/(\r\n|\n|\r)/gm, "")
        .split(';')
        .filter(item => item)
        .map((item, index) => getPCBObject(item, index));
}
