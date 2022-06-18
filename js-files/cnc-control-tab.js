const AUTO_CONTROL_PANEL = document.getElementById('auto-control-panel');
const MANUAL_CONTROL_PANEL = document.getElementById('manual-control-panel');

const TO_AUTO_CONTROL_BUTTON = document.getElementById('to-auto-control-panel');
const TO_MANUAL_CONTROL_BUTTON = document.getElementById('to-manual-control-panel');

TO_AUTO_CONTROL_BUTTON.addEventListener('click', () => {
    AUTO_CONTROL_PANEL.removeAttribute('hidden');
    MANUAL_CONTROL_PANEL.setAttribute('hidden', '');
});

TO_MANUAL_CONTROL_BUTTON.addEventListener('click', () => {
    MANUAL_CONTROL_PANEL.removeAttribute('hidden');
    AUTO_CONTROL_PANEL.setAttribute('hidden', '');
});
