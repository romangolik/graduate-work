let progressBar;

export const showProgressBar = () => {
    const getProgressBarTemplate = () => {
        const getProgressBarHtml = () => (`
              <div class="progress-bar">
                <div class="progress-bar__value"></div>
              </div>
            `);

        const html = new DOMParser().parseFromString(getProgressBarHtml(), 'text/html').body;
        return html.querySelector('.progress-bar');
    }

    progressBar = getProgressBarTemplate();
    document.querySelector('body').appendChild(progressBar);
}

export const hideProgressBar = () => {
    progressBar.remove();
}
