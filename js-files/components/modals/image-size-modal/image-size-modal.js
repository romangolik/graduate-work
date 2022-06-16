const getImageSizeModalHtml = () => {
    return `<div class="modal-window image-size-modal">
              <button
                  class="modal-window__close-button">
                  <svg class="modal-window__close-button-icon"><use xlink:href="#delete-icon"></use></svg>
              </button>
              <div class="modal-window__content">
                  <form>
                      <div class="input-field">
                          <label
                            for="name"
                            class="input-field__label">
                            Height, mm
                          </label>
                          <div class="input-field__input-wrapper">
                            <input
                              type="number"
                              name="height"
                              value="0"
                              class="input-field__input"
                              required>
                          </div>
                      </div>
                      <div class="input-field">
                          <label
                            for="name"
                            class="input-field__label">
                            Width, mm
                          </label>
                          <div class="input-field__input-wrapper">
                            <input
                              type="number"
                              name="width"
                              value="0"
                              class="input-field__input"
                              required>
                          </div>
                      </div>
                      <button 
                          type="submit" 
                          class="button image-size-modal__submit-button">
                          Підтвердити
                      </button>
                  </form>
              </div>
            </div>`
}

export const getImageSizeModalTemplate = resolve => {
    const html = new DOMParser().parseFromString(getImageSizeModalHtml(), 'text/html').body;
    const modalWindow = html.querySelector('.modal-window');

    modalWindow
        .querySelector('form')
        .addEventListener('submit', event => {
            event.preventDefault();
            const formData = new FormData(event.target);
            resolve(Object.fromEntries(formData));
        });

    html.querySelector('.modal-window__close-button')
        .addEventListener('click', () => resolve(null));

    return modalWindow;
}
