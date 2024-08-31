
let bigPicElement; /** Element with Open Photo Element */

let touchstartX = 0;
let touchendX = 0;

document.addEventListener('DOMContentLoaded', ()=> {
    bigPicElement = document.getElementById('big_pic');
    if (bigPicElement) {
        bigPicElement.addEventListener('touchstart', function(event) {
            touchstartX = event.changedTouches[0].screenX;
            touchstartY = event.changedTouches[0].screenY;
        });
        bigPicElement.addEventListener('touchend', function(event) {
            touchendX = event.changedTouches[0].screenX;
            touchendY = event.changedTouches[0].screenY;
            SwipeHandler();
        });
    }

//* Arrow key processing*/
window.addEventListener("keydown", keydownHandler, true);
})
function keydownHandler(event) {
    if (event.key == "ArrowRight") {
        goToNextPhoto();
    }
    if (event.key == "ArrowLeft") {
        goToPreviousPhoto();
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


//* Touchscreen swipe processing*/

function SwipeHandler() {
    const distance = 70 //Minimum distance for the swipe to work
    if (touchendX < touchstartX && (touchstartX - touchendX) > distance ) { //* Swiped left*/
        goToNextPhoto();
    }
    if (touchendX > touchstartX && (touchendX - touchstartX) > distance) { //* Swiped right*/
        goToPreviousPhoto();
    }
}
//* Common functions*/

function goToNextPhoto () {
    let elemdiv = document.getElementById("big_pic");
        let current_pic_number = elemdiv.firstElementChild.dataset.number;
        current_pic_number++;
        let next_img = document.querySelector(`img[data-number="${current_pic_number}"]`);
        if (next_img) {
            opener(next_img);
        }
}


function goToPreviousPhoto () {
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