const getPCBInformation = (primitives, size) => {
    if (primitives && size) {
        const statisticsData = {
            layersCount: new Set(),
            primitivesCount: 0,
            size: {
                height: 0,
                width: 0
            },
            layers: {}
        };

        primitives.reduce((result, current) => {
            result.layersCount.add(current.layer);
            result.primitivesCount += 1;
            result.layers[current.layer] = (result.layers[current.layer] || 0) + 1;

            return result;
        }, statisticsData);

        statisticsData.layersCount = statisticsData.layersCount.size;
        statisticsData.size = { ...size };

        return statisticsData;
    } else {
        return null;
    }
};

export const getPCBInformationHtml = data => {
    const LAYER_NAMES = {
        1: 'Верх мідь',
        2: 'Верхнє маркування',
        3: 'Низ мідь',
        4: 'Нижнє маркування',
        5: 'Внутрішній шар 1',
        6: 'Внутрішній шар 2',
        7: 'Контур плати'
    };

    if (data) {
        const pcbInformation = getPCBInformation(data.primitives, data.size);

        return `
            <h2>Інформація про плату</h2>
            <p>Загальна кількість PCB-об'єктів: <b>${pcbInformation.primitivesCount} шт.</b></p>
            <h4>Плата містить такі шари:</h4>
            ${Object.keys(pcbInformation.layers)
                .map(layer => 
                    `<p>Шар "${LAYER_NAMES[layer]}" (Містить PCB-об'єктів: <b>${pcbInformation.layers[layer]} шт.</b>)</p>`
                ).join('')}  
            <h4>Розмір плати:</h4>  
            <p>Висота: <b>${pcbInformation.size.height} мм</b></p>
            <p>Ширина: <b>${pcbInformation.size.width} мм</b></p>
        `
    } else {
        return `
            <h2>Інформація про плату</h2>
            <p>Загальна кількість PCB-об'єктів: 0</p>
            <h4>Плата містить такі шари:</h4>
            <p>Файл не обрано</p> 
            <h4>Розмір плати:</h4>  
            <p>Файл не обрано</p> 
        `
    }
};
