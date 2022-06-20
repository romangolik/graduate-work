import ConfigData from '../../../webAppConfig.json' assert { type: 'json' };

const getDeploymentSettingsData = () => {
    return ConfigData.deployment_settings;
}

export const getTechnicalSettingsData = () => {
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

export const getEconomicCalculationsData = () => {
    const economicCalculationsData = ConfigData.economic_calculations;

    Object
        .keys(economicCalculationsData)
        .forEach(key => {
            economicCalculationsData[key] = +economicCalculationsData[key];
        });

    return economicCalculationsData;
};

export const getTransferServerData = () => {
    return ConfigData.deployment_settings.transfer_server;
}

const getUvLaserTableInnerHtml = data => (`
    <tr class="tcam-settings__table-row">
      <td class="tcam-settings__table-cell tcam-settings__table-option">апертура</td>
      <td class="tcam-settings__table-cell tcam-settings__table-label">D<sub>a</sub></td>
      <td class="tcam-settings__table-cell tcam-settings__table-value">
        <input type="number" id="spon-aperture" value="${data.spon_aperture}" step="0.05" min="0.05" max="0.5">
      </td>
      <td class="tcam-settings__table-cell tcam-settings__table-units">мм</td>
    </tr>
    <tr class="tcam-settings__table-row">
      <td class="tcam-settings__table-cell tcam-settings__table-option">потужність</td>
      <td class="tcam-settings__table-cell tcam-settings__table-label">W</td>
      <td class="tcam-settings__table-cell tcam-settings__table-value">
        <input type="number" id="emission-power" value="${data.emission_power}" step="0.05">
      </td>
      <td class="tcam-settings__table-cell tcam-settings__table-units">Вт</td>
    </tr>
`);

const getNcMachineTableInnerHtml = data => (`
    <tr class="tcam-settings__table-row">
      <td class="tcam-settings__table-cell tcam-settings__table-option">швид.засвітки</td>
      <td class="tcam-settings__table-cell tcam-settings__table-label">F1</td>
      <td class="tcam-settings__table-cell tcam-settings__table-value">
        <input type="number" id="illumination-speed" min="100" max="5000" value="${data.F1}" step="100">
      </td>
      <td class="tcam-settings__table-cell tcam-settings__table-units">мм/хв</td>
    </tr>
    <tr class="tcam-settings__table-row">
      <td class="tcam-settings__table-cell tcam-settings__table-option">швид.позиц.</td>
      <td class="tcam-settings__table-cell tcam-settings__table-label">F0</td>
      <td class="tcam-settings__table-cell tcam-settings__table-value">
        <input type="number" id="positioning-speed" min="100" max="5000" value="${data.F0}" step="100">
      </td>
      <td class="tcam-settings__table-cell tcam-settings__table-units">мм/хв</td>
    </tr>
    <tr class="tcam-settings__table-row">
      <td class="tcam-settings__table-cell tcam-settings__table-option">пауза</td>
      <td class="tcam-settings__table-cell tcam-settings__table-label">P</td>
      <td class="tcam-settings__table-cell tcam-settings__table-value">
        <input type="number" id="pause" min="0.5" max="5" value="${data.wait_run}" step="0.05">
      </td>
      <td class="tcam-settings__table-cell tcam-settings__table-units">c</td>
    </tr>
`);

export const initMaterialSelect = () => {
    const materialsSelect = document.getElementById('material');

    const technicalSettingsData = getTechnicalSettingsData();

    materialsSelect.innerHTML = technicalSettingsData.materials.map((material, index) => {
        return index === 0 ?
            `<option value="${material.type}" selected>${material.type}</option>` :
            `<option value="${material.type}">${material.type}</option>`
    }).join('');
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
