import ConfigData from '../../../webAppConfig.json' assert { type: 'json' };

const getDeploymentSettingsData = () => {
    return ConfigData.deployment_settings;
}

const getTechnicalSettingsData = () => {
    const technicalSettingsData = ConfigData.technical_settings;

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

const getEconomicCalculationsData = () => {
    const economicCalculationsData = ConfigData.economic_calculations;

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
      <td class="tcam-settings__table-cell tcam-settings__table-value">
        <input type="number" value="${data.spon_aperture}" step="0.05">
      </td>
      <td class="tcam-settings__table-cell tcam-settings__table-units">мм</td>
    </tr>
    <tr class="tcam-settings__table-row">
      <td class="tcam-settings__table-cell tcam-settings__table-option">потужність</td>
      <td class="tcam-settings__table-cell tcam-settings__table-label">W</td>
      <td class="tcam-settings__table-cell tcam-settings__table-value">
        <input type="number" value="${data.emission_power}" step="0.05">
      </td>
      <td class="tcam-settings__table-cell tcam-settings__table-units">Вт</td>
    </tr>
`);

const getNcMachineTableInnerHtml = data => (`
    <tr class="tcam-settings__table-row">
      <td class="tcam-settings__table-cell tcam-settings__table-option">швид.засвітки</td>
      <td class="tcam-settings__table-cell tcam-settings__table-label">F1</td>
      <td class="tcam-settings__table-cell tcam-settings__table-value">
        <input type="number" value="${data.F1}" step="100">
      </td>
      <td class="tcam-settings__table-cell tcam-settings__table-units">мм/хв</td>
    </tr>
    <tr class="tcam-settings__table-row">
      <td class="tcam-settings__table-cell tcam-settings__table-option">швид.позиц.</td>
      <td class="tcam-settings__table-cell tcam-settings__table-label">F0</td>
      <td class="tcam-settings__table-cell tcam-settings__table-value">
        <input type="number" value="${data.F0}" step="100">
      </td>
      <td class="tcam-settings__table-cell tcam-settings__table-units">мм/хв</td>
    </tr>
    <tr class="tcam-settings__table-row">
      <td class="tcam-settings__table-cell tcam-settings__table-option">пауза</td>
      <td class="tcam-settings__table-cell tcam-settings__table-label">P</td>
      <td class="tcam-settings__table-cell tcam-settings__table-value">
        <input type="number" value="${data.wait_run}" step="0.05">
      </td>
      <td class="tcam-settings__table-cell tcam-settings__table-units">c</td>
    </tr>
`);

export const initMaterialSelect = () => {
    const materialsSelect = document.getElementById('material');

    const technicalSettingsData = getTechnicalSettingsData();

    const html = technicalSettingsData.materials.map(material => (`
        <option value="${material}">${material.type}</option>
    `)).join('');

    materialsSelect.innerHTML = `<option value="none" selected>none</option>` + html;
};

export const initTechModeData = () => {
    const qualityInput = document.getElementById('quality');
    const uvLaserTable = document.getElementById('uv-laser-table');
    const ncMachineTable = document.getElementById('nc-machine-table');

    const technicalSettingsData = getTechnicalSettingsData();
    const techModeData = technicalSettingsData.tech_mode;

    qualityInput.value = techModeData.quality;
    uvLaserTable.innerHTML = getUvLaserTableInnerHtml(techModeData);
    ncMachineTable.innerHTML = getNcMachineTableInnerHtml(techModeData);
};

const showTabByDeploymentType = data => {
    document.querySelectorAll('.sidebar__navigation-item')
        .forEach(link => {
            const value = link.getAttribute('data-show-by-type');
            if (value) {
                if (value === data) {
                    link.removeAttribute('hidden');
                } else {
                    link.setAttribute('hidden', '');
                }
            }
        });
}

showTabByDeploymentType(getDeploymentSettingsData().deployment_type);
