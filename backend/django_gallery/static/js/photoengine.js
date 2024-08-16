window.addEventListener("keydown", keydownHandler, true);

function keydownHandler(event) {
    if (event.key == "ArrowRight") {
        let elemdiv = document.getElementById("big_pic");
        let current_pic_number = elemdiv.firstElementChild.dataset.number;
        current_pic_number++;
        let next_img = document.querySelector(`img[data-number="${current_pic_number}"]`);
        if (next_img) {
            opener(next_img);
        }
    }
    if (event.key == "ArrowLeft") {
        let elemdiv = document.getElementById("big_pic");
        let current_pic_number = elemdiv.firstElementChild.dataset.number;
        current_pic_number--;
        let next_img = document.querySelector(`img[data-number="${current_pic_number}"]`);
        if (next_img) {
            opener(next_img);
        } else {
            // предыдущей картинки нет
        }
    }

    if (event.key == "Escape") {
        let elemdiv = document.getElementById("big_pic");
        closer(elemdiv);
        event.preventDefault();
    }
}

function opener(img) {
    let elem = document.getElementById("big_pic");
    elem.firstElementChild.src = img.src;
    elem.firstElementChild.dataset.number = img.dataset.number;
    elem.style.display = "flex";
}

function closer(elem) {
    elem.style.display = "none";
}

