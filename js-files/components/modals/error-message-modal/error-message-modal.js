const getErrorMessageModalHtml = (data) => {
    return `<div class="modal-window message-modal">
              <button
                class="modal-window__close-button">
                <svg class="modal-window__close-button-icon"><use xlink:href="#delete-icon"></use></svg>
              </button>
              <div class="modal-window__content">
                <svg class="message-modal__icon" width="71" height="70" viewBox="0 0 71 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M35.7592 43.3926C34.5999 43.3926 33.6602 42.4527 33.6602 41.2935V26.6C33.6602 25.4408 34.5999 24.501 35.7592 24.501C36.9186 24.501 37.8583 25.4408 37.8583 26.6V41.2935C37.8583 42.4528 36.9186 43.3926 35.7592 43.3926Z" fill="#050A0C"/>
                  <path d="M68.4586 53.9312L42.3266 10.3782C39.3617 5.43473 32.1598 5.42515 29.1891 10.3782L3.05687 53.9312C0.585618 58.0499 3.55881 63.3337 8.38063 63.3337H63.1348C67.9574 63.3337 70.9294 58.0493 68.4586 53.9312ZM63.1348 59.1355H8.38076C6.81669 59.1355 5.85768 57.4209 6.6569 56.0906L32.789 12.5376C34.1296 10.303 37.3843 10.3004 38.7267 12.5376L64.8587 56.0906C65.6571 57.4194 64.7003 59.1355 63.1348 59.1355Z" fill="#D6041D"/>
                 <path d="M35.758 51.7894C37.4969 51.7894 38.9066 50.3797 38.9066 48.6408C38.9066 46.9019 37.4969 45.4922 35.758 45.4922C34.0191 45.4922 32.6094 46.9019 32.6094 48.6408C32.6094 50.3797 34.0191 51.7894 35.758 51.7894Z" fill="#050A0C"/>
                </svg>
                <h2 class="message-modal__heading">${data.heading}</h2>
                <p class="message-modal__paragraph">${data.text}</p>
              </div>
            </div>`
}

export const getErrorMessageModalTemplate = (resolve, data) => {
    const html = new DOMParser().parseFromString(getErrorMessageModalHtml(data), 'text/html').body;

    html.querySelector('.modal-window__close-button')
        .addEventListener('click', () => resolve(null));

    return html.querySelector('.modal-window');
}
