import {
    sorting_zone,
    getMostNestedElement,
    moveCardToAnotherZone
} from '/static/admin/photo_sortzone/js/dynamic_sortzone.js';
import {
    validateYearInput
} from '/static/admin/photo_sortzone/js/validators.js';

let dragElement = window.photoSortingZone['dragElement']; 
let current_year = (new Date(Date.now()).getFullYear()).toString();


document.addEventListener("DOMContentLoaded", () => {
    loadPhotosByYearTemplate();    
});

function loadPhotosByYearTemplate() {
    let photo_cards = Array.from(sorting_zone.querySelectorAll('.photo-card'));
    let year_sorting_zones = new Map();
    let photo_year;

    photo_cards.forEach(photo_card => {
        let photo_date = getMostNestedElement(photo_card.querySelector('.field-date')).value
        if (photo_date == "") {
            photo_year = current_year;
        }
        else {
            photo_year = photo_date.slice(0,4);
        }

        if (!year_sorting_zones.has(photo_year)) {
            year_sorting_zones.set(photo_year, [photo_card]);
        }
        else {
            year_sorting_zones.get(photo_year).push(photo_card);
        }
    });

    //sort by years descending 
    year_sorting_zones = Array.from(year_sorting_zones).sort((a, b) => b[0] - a[0]);

    console.log(year_sorting_zones);
    // Create div for each year and headers of years
    year_sorting_zones.forEach(photosByYear => {
        let year = photosByYear.at(0);
        let photo_array = photosByYear.at(1);
        let yearSortingZone = sorting_zone.querySelector(`h3.year-header[textContent="${year}"]`)
        if (yearSortingZone) {
            yearSortingZone.style.display = 'flex';
        }
        else {
            yearSortingZone = document.createElement('div');
            yearSortingZone.classList.add('additional-divider', 'year-divider', `data-year-${year}`);
            yearSortingZone.innerHTML = `<h3 class="year-header divider-header">${year}</h3>`;
            sorting_zone.appendChild(yearSortingZone);

        }
        photo_array.forEach(photo_card => {
            yearSortingZone.appendChild(photo_card);
        })
        yearSortingZone.addEventListener('dragover', (event) => {
            event.preventDefault(); // Allow drop
        });
        yearSortingZone.addEventListener('drop', function(e) {
            let cardIsMoved = moveCardToAnotherZone(e);
            if (cardIsMoved) {
                changeYearOfCardDueToSortZone(cardIsMoved);
            }
        });
    });
    addYearTemplateButtons();
};


function addYearTemplateButtons() {
    let controlPanelElement = document.createElement("div");
    controlPanelElement.classList.add("sortzone-controlpanel");

    let addNewYearButtonElement = document.createElement("div");
    addNewYearButtonElement.innerHTML = '<input class=" additional-button add-year-button" type="button" value="Add Year" name="_add_year">'
    addNewYearButtonElement.addEventListener('click', triggerAddYearButton);
    controlPanelElement.appendChild(addNewYearButtonElement);

    sorting_zone.parentElement.insertBefore(controlPanelElement,sorting_zone);
}

function triggerAddYearButton() {
    let dialogueWindow = document.getElementById('dialogueWindow');
    let closeButton = dialogueWindow.querySelector(".close-button");
    let dialogueHeader = dialogueWindow.querySelector(".dialogue-header");

    dialogueWindow.style.display = "block";
     // Close the modal when the close button is clicked
    closeButton.onclick = function() {
        dialogueWindow.style.display = "none";
    }
 
     // Close the modal when clicking outside of the modal content
    window.onclick = function(event) {
        if (event.target == dialogueWindow) {
            dialogueWindow.style.display = "none";
        }
    }

    dialogueHeader.textContent = 'Write year to add';
 
    document.getElementById("confirmButton").onclick = function() {
         //validate that written data is corect
         let errorMessage = dialogueWindow.querySelector('.modal-error-message');
         let dialogueWindowInput = dialogueWindow.querySelector(".dialogue-input").value 
         let existentYears = getExistentYears();
         const isValidInput = validateYearInput(parseInt(dialogueWindowInput), existentYears);
         if (isValidInput === true) {
            AddNewYearSubdividerElement(dialogueWindowInput);
             dialogueWindow.style.display = "none";
         }
         else {
            errorMessage.innerHTML = isValidInput;
            errorMessage.style.display ='block';
         }
            
     }
}

function AddNewYearSubdividerElement(year) {
    let newYear = document.createElement('div');
    newYear.classList.add('additional-divider', 'year-divider', `data-year-${year}`);
    newYear.innerHTML = `<h3 class="year-header divider-header">${year}</h3>`;
    newYear.addEventListener('dragover', (event) => {
        event.preventDefault(); // Allow drop
    });

    newYear.addEventListener('drop', function(e) {
        let cardIsMoved = moveCardToAnotherZone(e);
        if (cardIsMoved) {
            changeYearOfCardDueToSortZone(cardIsMoved);
        }
    });
    sorting_zone.appendChild(newYear);
};

function changeYearOfCardDueToSortZone(card) {
    let newYear  = getYearFromClass(card.parentElement);
    let yearField = getCardYearField(card)
    let yearFieldValue = yearField.value 
    let current_month = (new Date(Date.now()).getMonth+1).toString();
    let current_day = (new Date(Date.now()).getDate()).toString();
    if (yearFieldValue == "") {
        yearField.value = `${current_day}-${current_month}-${current_year}`;
    }
    else {
        yearField.value = `${newYear}${yearFieldValue.slice(4)}`;
    }
};

function getYearFromClass(element) {
    const classes = element.classList;
    let year = null;
    let appropriate_format = /^data-year-[0-9]{4}$/;
    classes.forEach(className => {
        if (appropriate_format.test(className)) {
            year = parseInt(className.slice(-4));
        }
    })
    return year
}

function getExistentYears() {
    let existentYears = sorting_zone.querySelectorAll(".year-divider");
    existentYears = Array.from(existentYears, element => getYearFromClass(element));
    return existentYears
}


function getCardYearField(card) {
    return getMostNestedElement(card.querySelector(".field-date"))
};
