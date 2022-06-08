export const initUploadAreaControl = (id) => {
    const UPLOAD_AREA = document.getElementById(id);
    const FILE_INPUT = UPLOAD_AREA.querySelector('input[type=file]');
    const SELECTED_FILE_SPAN = UPLOAD_AREA.querySelector('.upload-area__file-name');

    FILE_INPUT.addEventListener('change', event => {
        const fileName = event.target.files[0]?.name;
        if (fileName) {
            setFileName(fileName);
        }
    });

    UPLOAD_AREA.addEventListener('dragover', () => {
        UPLOAD_AREA.classList.add('upload-area__dragover');
    });

    UPLOAD_AREA.addEventListener('dragleave', () => {
        UPLOAD_AREA.classList.remove('upload-area__dragover');
    });

    UPLOAD_AREA.addEventListener('drop', () => {
        UPLOAD_AREA.classList.remove('upload-area__dragover');
    });

    const setFileName = fileName => {
        SELECTED_FILE_SPAN.textContent = fileName;
    }

    const resetFileName = () => {
        SELECTED_FILE_SPAN.textContent = 'Файл не обрано';
    }

    return {
        FILE_INPUT,
        resetFileName
    };
}
