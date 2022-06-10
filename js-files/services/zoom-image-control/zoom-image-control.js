export const initZoomImageControl = (imageWrapperId, scalingSelectId, scalingHandler) => {
    const DEFAULT_SCALE = 1;
    const IMAGE_SIZE_MULTIPLICITY = 10;

    const IMAGE_WRAPPER = document.getElementById(imageWrapperId);
    const SCALING_SELECT = document.getElementById(scalingSelectId);

    let isDown;
    let isMouseEvent;
    let pos = { top: 0, left: 0, startX: 0, startY: 0 }

    const mouseIsDown = event => {
        isMouseEvent = event instanceof MouseEvent;

        const pageY = isMouseEvent ? event.pageY : event.touches[0].pageY;
        const pageX = isMouseEvent ? event.pageX : event.touches[0].pageX;

        isDown = true;
        IMAGE_WRAPPER.style.cursor = 'grabbing';
        pos.startY = pageY - IMAGE_WRAPPER.offsetTop;
        pos.startX = pageX - IMAGE_WRAPPER.offsetLeft;
        pos.top = IMAGE_WRAPPER.scrollTop;
        pos.left = IMAGE_WRAPPER.scrollLeft;

        if (isMouseEvent) {
            document.addEventListener('mouseup', mouseUp);
            document.addEventListener('mousemove', mouseMove);
        } else {
            IMAGE_WRAPPER.addEventListener('touchend', mouseUp);
            IMAGE_WRAPPER.addEventListener('touchmove', mouseMove);
        }
    }

    const mouseUp = () => {
        isDown = false;
        IMAGE_WRAPPER.style.cursor = 'grab';

        if (isMouseEvent) {
            document.removeEventListener('mouseup', mouseUp);
            document.removeEventListener('mousemove', mouseMove);
        } else {
            IMAGE_WRAPPER.removeEventListener('touchend', mouseUp);
            IMAGE_WRAPPER.removeEventListener('touchmove', mouseMove);
        }
    }

    const mouseMove = event => {
        if (isDown) {
            event.preventDefault();
            const pageY = isMouseEvent ? event.pageY : event.touches[0].pageY;
            const pageX = isMouseEvent ? event.pageX : event.touches[0].pageX;

            const y = pageY - IMAGE_WRAPPER.offsetTop;
            const x = pageX - IMAGE_WRAPPER.offsetLeft;
            const walkY = y - pos.startY;
            const walkX = x - pos.startX;
            IMAGE_WRAPPER.scrollTop = pos.top - walkY;
            IMAGE_WRAPPER.scrollLeft = pos.left - walkX;
        }
    }

    const resetScalingSelectValue = () => {
        SCALING_SELECT.value = DEFAULT_SCALE;
        SCALING_SELECT.dispatchEvent(new Event('change'));
    }

    IMAGE_WRAPPER.addEventListener('mousedown', mouseIsDown);
    IMAGE_WRAPPER.addEventListener('touchstart', mouseIsDown);
    SCALING_SELECT.addEventListener('change', event => scalingHandler(event, IMAGE_SIZE_MULTIPLICITY));

    return {
        IMAGE_WRAPPER,
        resetScalingSelectValue
    }
}
