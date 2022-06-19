const getSuccessfulOrderModalHtml = (data) => {
    return `<div class="modal-window message-modal">
              <button
                class="modal-window__close-button">
                <svg class="modal-window__close-button-icon"><use xlink:href="#delete-icon"></use></svg>
              </button>
              <div class="modal-window__content">
                <svg class="message-modal__icon"><use xlink:href="#successful-icon"></use></svg>
                <h2 class="message-modal__heading">${data.heading}</h2>
                <p class="message-modal__paragraph">${data.text}</p>
              </div>
            </div>`
}

export const getSuccessfulOrderModalTemplate = (resolve, data) => {
    const html = new DOMParser().parseFromString(getSuccessfulOrderModalHtml(data), 'text/html').body;

    html.querySelector('.modal-window__close-button')
        .addEventListener('click', () => resolve(null));

    return html.querySelector('.modal-window');
}
