/*
const RANGE_INPUT = document.getElementById('range-input');
const RANGE_SLIDER = document.getElementById('range-slider');

RANGE_INPUT.value = RANGE_SLIDER.value;

RANGE_SLIDER.addEventListener('input', event => {
    RANGE_INPUT.value = event.target.value;
});

let timer;
RANGE_INPUT.addEventListener('input', event => {
    if (timer) {
        clearTimeout(timer);
    }
    timer = setTimeout(() => {
        RANGE_SLIDER.value = event.target.value;
        RANGE_INPUT.value = RANGE_SLIDER.value;
    }, 500);
});
*/
