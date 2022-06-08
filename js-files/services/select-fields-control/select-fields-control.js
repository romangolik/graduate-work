export const initSelectFieldsControl = () => {
    document.querySelectorAll('.select-field')
        .forEach(selectField => {
            let isOpen = false;
            const select = selectField.querySelector('select');

            const closeDropDown = () => {
                isOpen = false;
                document.querySelector('.select-field__options').remove();
                document.querySelector('.select-field__overlay').remove();
            }

            selectField.addEventListener('change', () => {
                if (isOpen) {
                    closeDropDown();
                }
            });

            select.addEventListener('mousedown', event => {
                if (window.innerWidth >= 540) {
                    event.preventDefault();

                    if (!isOpen) {
                        isOpen = true;
                        selectField.classList.add('select-field_active');

                        const dropDown = document.createElement('ul');
                        dropDown.className = 'select-field__options';

                        const overlay = document.createElement('div');
                        overlay.className = 'select-field__overlay';

                        [ ...select.children ].forEach(option => {
                            const dropDownOption = document.createElement('li');
                            dropDownOption.textContent = option.textContent;
                            dropDownOption.className = 'select-field__option';

                            if (option.selected) {
                                dropDownOption.classList.add('select-field__option_selected');
                            }

                            dropDownOption.addEventListener('mousedown', (e) => {
                                e.stopPropagation();
                                select.value = option.value;
                                selectField.value = option.value;
                                select.dispatchEvent(new Event('change'));
                                selectField.dispatchEvent(new Event('change'));
                                dropDown.remove();
                            });

                            dropDown.appendChild(dropDownOption);
                        });

                        overlay.addEventListener('click', () => closeDropDown());

                        selectField.appendChild(overlay);
                        selectField.querySelector('.select-field__wrapper').appendChild(dropDown);
                    } else {
                        closeDropDown();
                    }
                }
            });
        });
}
