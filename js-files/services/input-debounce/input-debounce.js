export const initInputDebounce = (input, handler, debounceTime = 500) => {
    let timer;

    input.addEventListener('change', event => {
        input.value = event.target.value;
        if (handler) {
            handler();
        }
    });

    input.addEventListener('keyup', event => {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            const value = event.target.value;
            const minValue = input.getAttribute('min');
            const maxValue = input.getAttribute('max');

            if (minValue && +value < +minValue) {
                input.value = minValue
            } else if (maxValue && +value > +maxValue) {
                input.value = maxValue;
            } else {
                input.value = value;
            }

            if (handler) {
                handler();
            }
        }, debounceTime);
    });
}
