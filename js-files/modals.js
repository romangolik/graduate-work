const MODALS = {
    SET_PCB_SIZE: 'SET_PCB_SIZE',
    ERROR_MESSAGE: 'ERROR_MESSAGE'
}

const openModal = (type, data, props) => {
    const getPCBSizeModalTemplate = (submitHandler) => {
        const getPCBSizeModalHtml = () => {
            return `<div class="modal-window">
              <form>
                  <label>
                    <span>Height, mm</span>
                    <input type="number" name="height" value="0">
                  </label>
                  <label>
                    <span>Width, mm</span>
                    <input type="number" name="width" value="0">
                  </label>
                  <button type="submit">Set</button>
              </form>
            </div>`
        }

        const html = new DOMParser().parseFromString(getPCBSizeModalHtml(), 'text/html').body;
        const modalWindow = html.querySelector('.modal-window');

        modalWindow
            .querySelector('form')
            .addEventListener('submit', event => {
                event.preventDefault();
                const formData = new FormData(event.target);
                submitHandler(Object.fromEntries(formData));
            });

        return modalWindow;
    }

    const getErrorMessageTemplate = (resolve, data) => {
        const getErrorMessageHtml = (data) => {
            return `<div class="modal-window">
              <h2>${data.heading}</h2>
              <p>${data.text}</p>
            </div>`
        }

        const html = new DOMParser().parseFromString(getErrorMessageHtml(data), 'text/html').body;
        return html.querySelector('.modal-window');
    }

    const MODALS_TEMPLATES = {
        [MODALS.SET_PCB_SIZE]: getPCBSizeModalTemplate,
        [MODALS.ERROR_MESSAGE]: getErrorMessageTemplate
    }

    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.setAttribute('class', 'modal-container');
        const modalWindow = MODALS_TEMPLATES[type](resolve, data, props);
        overlay.appendChild(modalWindow);

        modalWindow.addEventListener('click', event => event.stopPropagation());
        overlay.addEventListener('click', () => resolve(null));

        document.body.appendChild(overlay);
    }).then(data => {
        closeModal();
        return data;
    });
}

const closeModal = () => {
    const overlay = document.querySelector('.modal-container');
    overlay.remove();
};
