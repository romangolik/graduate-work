import { getImageSizeModalTemplate } from './image-size-modal/image-size-modal.js';
import { getErrorMessageModalTemplate } from './error-message-modal/error-message-modal.js';
import { getSuccessfulOrderModalTemplate } from './successful-order-modal/successful-order-modal.js';

import { MODAL_TYPES } from './_data/modal-types.js';

const MODAL_TYPE_TEMPLATES = {
    [MODAL_TYPES.SET_PCB_SIZE]: getImageSizeModalTemplate,
    [MODAL_TYPES.ERROR_MESSAGE]: getErrorMessageModalTemplate,
    [MODAL_TYPES.SUCCESSFUL_ORDER_MODAL]: getSuccessfulOrderModalTemplate
}

export const openModal = (type, data, props) => {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.setAttribute('class', 'modal-container');
        const modalWindow = MODAL_TYPE_TEMPLATES[type](resolve, data, props);
        overlay.appendChild(modalWindow);

        modalWindow.addEventListener('click', event => event.stopPropagation());
        overlay.addEventListener('click', () => resolve(null));

        document.body.appendChild(overlay);
    }).then(data => {
        closeModal();
        return data;
    });
}

export const closeModal = () => {
    const overlay = document.querySelector('.modal-container');
    overlay.remove();
};
