const getImageSizeModalHtml = () => {
    return `<div class="modal-window">
              <div class="modal-window__inner">
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
              </div>
            </div>`
}

export const getImageSizeModalTemplate = submitHandler => {
    const html = new DOMParser().parseFromString(getImageSizeModalHtml(), 'text/html').body;
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
