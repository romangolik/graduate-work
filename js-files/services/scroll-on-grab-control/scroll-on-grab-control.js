export const initScrollOnGrabControl = (imageWrapper) => {
    let startX;
    let startY;
    let isDown;
    let scrollTop;
    let scrollLeft;

    const mouseIsDown = (event, mouseEvent) => {
        const pageY = mouseEvent ? event.pageY : event.touches[0].pageY;
        const pageX = mouseEvent ? event.pageX : event.touches[0].pageX;

        isDown = true;
        imageWrapper.style.cursor = 'grabbing';
        startY = pageY - imageWrapper.offsetTop;
        startX = pageX - imageWrapper.offsetLeft;
        scrollTop = imageWrapper.scrollTop;
        scrollLeft = imageWrapper.scrollLeft;
    }

    const mouseUp = () => {
        isDown = false;
        imageWrapper.style.cursor = 'grab';
    }

    const mouseLeave = () => {
        isDown = false;
        imageWrapper.style.cursor = 'grab';
    }

    const mouseMove = (event, mouseEvent) => {
        if (isDown) {
            event.preventDefault();
            const pageY = mouseEvent ? event.pageY : event.touches[0].pageY;
            const pageX = mouseEvent ? event.pageX : event.touches[0].pageX;

            const y = pageY - imageWrapper.offsetTop;
            const x = pageX - imageWrapper.offsetLeft;
            const walkY = y - startY;
            const walkX = x - startX;
            imageWrapper.scrollTop = scrollTop - walkY;
            imageWrapper.scrollLeft = scrollLeft - walkX;
        }
    }

    imageWrapper.addEventListener('mousedown', (e) => mouseIsDown(e, true));
    imageWrapper.addEventListener('mouseup', () => mouseUp());
    imageWrapper.addEventListener('mouseleave', () => mouseLeave());
    imageWrapper.addEventListener('mousemove', (e) => mouseMove(e, true));

    imageWrapper.addEventListener('touchstart', (e) => mouseIsDown(e, false));
    imageWrapper.addEventListener('touchend', () => mouseUp());
    imageWrapper.addEventListener('touchmove', (e) => mouseMove(e, false));
}
