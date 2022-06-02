const initScrollOnGrab = (imageWrapper) => {
    let startX;
    let startY;
    let isDown;
    let scrollTop;
    let scrollLeft;

    const mouseIsDown = (event) => {
        isDown = true;
        imageWrapper.style.cursor = 'grabbing';
        startY = event.pageY - imageWrapper.offsetTop;
        startX = event.pageX - imageWrapper.offsetLeft;
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

    const mouseMove = (event) => {
        if (isDown) {
            event.preventDefault();
            const y = event.pageY - imageWrapper.offsetTop;
            const x = event.pageX - imageWrapper.offsetLeft;
            const walkY = y - startY;
            const walkX = x - startX;
            imageWrapper.scrollTop = scrollTop - walkY;
            imageWrapper.scrollLeft = scrollLeft - walkX;
        }
    }

    imageWrapper.addEventListener("mousedown", (e) => mouseIsDown(e));
    imageWrapper.addEventListener("mouseup", () => mouseUp());
    imageWrapper.addEventListener("mouseleave", () => mouseLeave());
    imageWrapper.addEventListener("mousemove", (e) => mouseMove(e));
}
