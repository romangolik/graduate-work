export const generateGCode = (tcamSettingData) => {
    const lines = [];
    const {
        leftZone,
        rightZone,
    } = tcamSettingData.technologicalScheme;
    const {
        material,
        length,
        time,
        totalCost
    } = tcamSettingData.manufacturingParams;
    const {
        F0,
        F1,
        emission_power,
        spon_aperture,
        wait_run
    } = tcamSettingData.processParams;

    const addStartFile = () => {
        if (tcamSettingData.transferToPcb) {
            lines.push(`;@ схема – ${leftZone}-${rightZone}`);
            lines.push(`;@ матеріал – ${material.type}`);
            lines.push(`;@ апертура D_a = ${spon_aperture} мм`);
            lines.push(`;@ потужність випромінювання W = ${emission_power} Вт`);
            lines.push(`;@ швидкість засвітки F1 = ${F1} мм/хв`);
            lines.push(`;@ швидкість позиціювання F0 = ${F0} мм/хв`);
            lines.push(`;@ затримка переміщення P = ${wait_run} c`);
            lines.push(`;@ протяжність гравіровки L = ${length} м`);
            lines.push(`;@ очікуваний час обробки T = ${time} с`);
            lines.push(`;@ вартість замовлення з ПДВ ${totalCost} грн`);
        }

        lines.push('G17');
        lines.push('G21');
        lines.push('G54');
        lines.push('G90');
        lines.push('M08');
    }

    const addEnd = () => {
        lines.push('M09');
        lines.push('M02');
    }

    return new Promise(resolve => {
        addStartFile();

        tcamSettingData.offsetPrimitives.forEach(primitive => {
            primitive.points.forEach(({ x, y }, index) => {
                if (index === 0) {
                    lines.push(`G00 X${x.toFixed(3)} Y${y.toFixed(3)} F${F0}`);
                    lines.push(`M03 G04 P${wait_run}`);
                } else {
                    lines.push(index === 1 ?
                        `G01 X${x.toFixed(3)} Y${y.toFixed(3)} F${F1}` :
                        `X${x.toFixed(3)} Y${y.toFixed(3)}`);
                }
            });
            lines.push('M05');
        });

        addEnd();

        resolve(lines.join('\r\n'));
    });
}
