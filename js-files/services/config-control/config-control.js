const getConfigData = async () => {
    let configData;
    await fetch('../../_data/webAppConfig.json')
        .then(data => data.json())
        .then(data => configData = data);
    return configData;
};

const getTechnicalSettingsData = async () => {
    const configData = await getConfigData();
    const technicalSettingsData = configData.technical_settings;

    technicalSettingsData.materials = technicalSettingsData.materials.map(material => ({
        ...material,
        cost: +material.cost
    }));

    Object
        .keys(technicalSettingsData.tech_mode)
        .forEach(key => {
            technicalSettingsData.tech_mode[key] = +technicalSettingsData.tech_mode[key];
        });

    return technicalSettingsData;
};

const getEconomicCalculationsData = async () => {
    const configData = await getConfigData();
    const economicCalculationsData = configData.economic_calculations;

    Object
        .keys(economicCalculationsData.coefficients)
        .forEach(key => {
            economicCalculationsData.coefficients[key] = +economicCalculationsData.coefficients[key];
        });

    return economicCalculationsData;
};

const getUvLaserTableInnerHtml = data => (`
    <tr class="tcam-settings__table-row">
      <td class="tcam-settings__table-cell tcam-settings__table-option">апертура</td>
      <td class="tcam-settings__table-cell tcam-settings__table-label">D<sub>a</sub></td>
      <td class="tcam-settings__table-cell tcam-settings__table-value">${data.spon_aperture}</td>
      <td class="tcam-settings__table-cell tcam-settings__table-units">мм</td>
    </tr>
    <tr class="tcam-settings__table-row">
      <td class="tcam-settings__table-cell tcam-settings__table-option">потужність</td>
      <td class="tcam-settings__table-cell tcam-settings__table-label">W</td>
      <td class="tcam-settings__table-cell tcam-settings__table-value">${data.emission_power}</td>
      <td class="tcam-settings__table-cell tcam-settings__table-units">Вт</td>
    </tr>
`);

const getNcMachineTableInnerHtml = data => (`
    <tr class="tcam-settings__table-row">
      <td class="tcam-settings__table-cell tcam-settings__table-option">швид.засвітки</td>
      <td class="tcam-settings__table-cell tcam-settings__table-label">F1</td>
      <td class="tcam-settings__table-cell tcam-settings__table-value">${data.F1}</td>
      <td class="tcam-settings__table-cell tcam-settings__table-units">мм/хв</td>
    </tr>
    <tr class="tcam-settings__table-row">
      <td class="tcam-settings__table-cell tcam-settings__table-option">швид.позиц.</td>
      <td class="tcam-settings__table-cell tcam-settings__table-label">F0</td>
      <td class="tcam-settings__table-cell tcam-settings__table-value">${data.F0}</td>
      <td class="tcam-settings__table-cell tcam-settings__table-units">мм/хв</td>
    </tr>
    <tr class="tcam-settings__table-row">
      <td class="tcam-settings__table-cell tcam-settings__table-option">пауза</td>
      <td class="tcam-settings__table-cell tcam-settings__table-label">P</td>
      <td class="tcam-settings__table-cell tcam-settings__table-value">${data.wait_run}</td>
      <td class="tcam-settings__table-cell tcam-settings__table-units">c</td>
    </tr>
`);

export const initMaterialSelect = async () => {
    const materialsSelect = document.getElementById('material');

    const technicalSettingsData = await getTechnicalSettingsData();

    const html = technicalSettingsData.materials.map(material => (`
        <option value="${material}">${material.type}</option>
    `)).join('');

    materialsSelect.innerHTML = `<option value="none" selected>none</option>` + html;
};

export const initTechModeData = async () => {
    const qualityInput = document.getElementById('quality');
    const uvLaserTable = document.getElementById('uv-laser-table');
    const ncMachineTable = document.getElementById('nc-machine-table');

    const technicalSettingsData = await getTechnicalSettingsData();
    const techModeData = technicalSettingsData.tech_mode;

    qualityInput.value = techModeData.quality;
    uvLaserTable.innerHTML = getUvLaserTableInnerHtml(techModeData);
    ncMachineTable.innerHTML = getNcMachineTableInnerHtml(techModeData);
};
