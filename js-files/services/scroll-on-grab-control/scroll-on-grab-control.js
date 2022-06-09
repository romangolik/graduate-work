export const initScrollOnGrabControl = (imageWrapper) => {
    let isMouseEvent;
    let pos = { top: 0, left: 0, x: 0, y: 0 };

    const mouseDownHandler = event => {
        imageWrapper.style.cursor = 'grabbing';
        imageWrapper.style.userSelect = 'none';

        isMouseEvent = event instanceof MouseEvent;

        pos = {
            left: imageWrapper.scrollLeft,
            top: imageWrapper.scrollTop,
            x: isMouseEvent ? event.clientX : event.touches[0].clientX,
            y: isMouseEvent ? event.clientY : event.touches[0].clientY,
        };

        if (isMouseEvent) {
            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        } else {
            document.addEventListener('touchmove', mouseMoveHandler);
            document.addEventListener('touchend', mouseUpHandler);
        }
    };

    const mouseMoveHandler = event => {
        const dx = (isMouseEvent ? event.clientX : event.touches[0].clientX) - pos.x;
        const dy = (isMouseEvent ? event.clientY : event.touches[0].clientY) - pos.y;

        imageWrapper.scrollTop = pos.top - dy;
        imageWrapper.scrollLeft = pos.left - dx;
    };

    const mouseUpHandler = () => {
        if (isMouseEvent) {
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        } else {
            document.removeEventListener('touchmove', mouseMoveHandler);
            document.removeEventListener('touchend', mouseUpHandler);
        }

        imageWrapper.style.cursor = 'grab';
        imageWrapper.style.removeProperty('user-select');
    };

    imageWrapper.addEventListener('mousedown', mouseDownHandler);
    imageWrapper.addEventListener('touchstart', mouseDownHandler);
}
