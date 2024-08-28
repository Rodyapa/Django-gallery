window.photoSortingZone = {
    'sorting_zone': null,
    'dragElement': null
    };

import {
    validateSubcategoryName
} from '/static/admin/photo_dropzone/js/validators.js';

export let sorting_zone = window.photoSortingZone['sorting_zone'];
export let dragElement = window.photoSortingZone['dragElement']; 

document.addEventListener("DOMContentLoaded", () => {
    sorting_zone = document.querySelector('.sorting-zone');
    const photoCards = document.querySelectorAll('.photo-card');

    photoCards.forEach(card => {
        card.addEventListener('dragover', function(e) {
            e.preventDefault();
            if (dragElement && dragElement.classList.contains('photo-card') &&
                dragElement !== e.target) {
                this.classList.add('drag-over');
            }
        });
    
        card.addEventListener('dragleave', function() {
            this.classList.remove('drag-over');
        });

        card.addEventListener('drop', function(e) {
            let target_element = e.target.closest('.photo-card')
            if (dragElement !== e.target) {
                sortPhotoCards(dragElement, target_element, photoCards)}
            target_element.classList.remove('drag-over');
        }
        ); 
    });

    sorting_zone.addEventListener('dragstart', (event) => {
        dragElement = event.target.closest('[draggable=true]');
        dragElement.classList.add('sorting-ghost');
    });

    sorting_zone.addEventListener('dragend', function(event) {
        if (dragElement) {
            dragElement.classList.remove('sorting-ghost');
        }
    })
});

function sortPhotoCards(dragged_card, target_card, arrayOfCards) {
    let targetCardGoesDown;
    //check if card in the has same parent element.
    if (dragged_card.parentElement == target_card.parentElement) {
        let parentElementOfCards = dragged_card.parentElement;
        const indexOfDraggedCard = Array.from(parentElementOfCards.children).indexOf(dragged_card);
        const indexOfTargetCard = Array.from(parentElementOfCards.children).indexOf(target_card);
        if (indexOfDraggedCard < indexOfTargetCard) {
            targetCardGoesDown=true;
        } else {
            targetCardGoesDown=false;
        }
        
        if (targetCardGoesDown) {
            let cardsBetween = getCardsBetween(dragged_card, target_card);
            cardsBetween.forEach(card => {
                let orderIDField = getCardOrderField(card);
                orderIDField.value = (parseInt(orderIDField.value) - 1).toString();
                console.log(orderIDField.value);
            });
            let dragged_card_order_field = getCardOrderField(dragged_card);
            dragged_card_order_field.value = ((parseInt(dragged_card_order_field.value)+cardsBetween.length)).toString();
            target_card.after(dragged_card);
        } else {
            let cardsBetween = getCardsBetween(target_card, dragged_card);
            cardsBetween.forEach(card => {
                let orderIDField = getCardOrderField(card);
                orderIDField.value = (parseInt(orderIDField.value) + 1).toString();
            });
            let dragged_card_order_field = getCardOrderField(dragged_card);
            dragged_card_order_field.value = ((parseInt(dragged_card_order_field.value)-cardsBetween.length)).toString();
            parentElementOfCards.insertBefore(dragged_card, target_card);
        }

        const swapOrderIDs = ((dragged_card, target_card) => {
            let dragged_card_order_field= getCardOrderField(dragged_card);
            let target_card_order_field = getCardOrderField(target_card);
            let temp = dragged_card_order_field.value;
            dragged_card_order_field.value = target_card_order_field.value;
            target_card_order_field.value = temp;

        })(dragged_card, target_card);
    }
    else {
    }
};

export function getMostNestedElement(element) {
    let children = element.children;
    
    // Base case: If the element has no child, it is the most nested element
    if (children.length === 0) {
        return element;
    } else {
        // Recursive case: Continue to the child element
        return getMostNestedElement(children[0]);
    }
}

function getCardOrderField(card) {
    return getMostNestedElement(card.querySelector(".field-order"))
};

function getCardYearField(card) {
    return getMostNestedElement(card.querySelector(".field-date"))
};

function getCardsBetween(startCard, endCard) {
    const parentElement = startCard.parentElement;

    let cardsBetween = [];
    let sibling = startCard.nextSibling;

    while (sibling !== endCard) {
        if (sibling.tagName && sibling.tagName.toLowerCase() === 'div') {
            cardsBetween.push(sibling);
        }
        sibling = sibling.nextSibling;
    }

    return cardsBetween;
};


/**
document.addEventListener("DOMContentLoaded", () => {
    let templateSelectField = document.querySelector('#id_template')
 
    templateChoices = setInitTemplateChoices(templateSelectField);
    setTemplateAppearance(templateSelectField.value); // Initialy set template for sorting zone
    templateSelectField.addEventListener('change', () => { 
     setTemplateAppearance(
     templateSelectField.value)}); 
 });
 **/
 /**
  * Function makes map objects with int values of template Select Field and 
  * coresponding text descriptions and "template load functions". Function needed for make code in this module 
  * less complicated.
  */

/**  function setInitTemplateChoices(select_field) {
     let templateChoices = new Map();
     Array.from(select_field.options).forEach(option => {
         let corespondingLoadFunction = (option.text == 'year_sorted') ? loadPhotosByYearTemplate :
             (option.text == 'subdivided') ? loadPhotosBySubcategories :
             loadRegularTemplate
         templateChoices.set(option.value, {'text_value': option.text,
                                            'template_load_func': corespondingLoadFunction
         });
     });
     return templateChoices
 };
 */

/**  function setTemplateAppearance(selected_template) {
     let functionToLoad = templateChoices.get(selected_template)['template_load_func'];
     functionToLoad();
 };
 */

 
 
 function loadRegularTemplate() {
     // Delete all year-headers 
 
     //delete additional dividing divs in sorting zone. "Unpack" all photo-cards
     //into main sorting zone.
     let additionalDividers = sorting_zone.querySelectorAll('.additional-divider');
 
     for (let divider of additionalDividers) {
         let relatedPhotoCards = divider.querySelectorAll('div.photo-card');
         relatedPhotoCards.forEach(card => sorting_zone.append(card));
         divider.style.display = 'none';
     };
     // delete additional buttons from sorting zone.
     let additionalButtons = sorting_zone.querySelectorAll('.additional-button');
     for (let button of additionalButtons ) {
         button.style.display= 'none';
     }
 };
 
 
 
 function triggerSubcategoryButton() {
     let dialogueWindow = document.getElementById('dialogueWindow');
     let closeButton = dialogueWindow.querySelector(".close-button");
 
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
 
     // Optional: Add functionality for the confirm button
     document.getElementById("confirmButton").onclick = function() {
         //validate that written data is corect
         let errorMessage = dialogueWindow.querySelector('.modal-error-message');
         let newSubcategoryName=dialogueWindow.querySelector('.subcategory-name');
         let dialogueWindowInput = newSubcategoryName.value 
         let existentSubcategories = sorting_zone.querySelectorAll('.subcategory-header');
         existentSubcategories = Array.from(existentSubcategories, node => node.textContent);
         if (dialogueWindowInput == "") {
             errorMessage.innerHTML = 'You must define subcategory name';
             errorMessage.style.display ='block';
         }
         else if (existentSubcategories.includes(dialogueWindowInput)) {
             errorMessage.innerHTML = 'This subcategory already exist';
             errorMessage.style.display ='block';
         }
         else if (!validateSubcategoryName(dialogueWindowInput)) {
             errorMessage.innerHTML = ('Subcategory name can accept only english and russian letters ' +
                                       'and arabic numbers');
             errorMessage.style.display ='block';
         }
         else {
             addNewSubcategory(dialogueWindowInput);
             dialogueWindow.style.display = "none";
         }        
     }
 };
 
 function addNewSubcategory(subcategoryName) {
    let newSubcategory = document.createElement('div');
    newSubcategory.classList.add('additional-divider', 'subcategory-divider');
    newSubcategory.id = (`subcategory-${subcategoryName.replace(/ /g, '-')}`);
    newSubcategory.innerHTML = `<h3 class='subcategory-header divider-header'>${subcategoryName}</h3>`;
    
    newSubcategory.addEventListener('dragover', (event) => {
        event.preventDefault(); // Allow drop
    });
    newSubcategory.addEventListener('drop', moveCardToAnotherZone);
    sorting_zone.appendChild(newSubcategory);
 };
 

 export function moveCardToAnotherZone(event) {
    if (!event.target.closest('.photo-card')){
        let target_element = event.target.closest('.additional-divider')
            if (dragElement.closest('.additional-divider') !== target_element) {
                cascadeOrderChange(dragElement);
                target_element.appendChild(dragElement);
                return dragElement;
            }
    }
    return false;
 }


 function extractSubcategory(inputString) {
    const prefix = 'subcategory-';
    const startIndex = prefix.length;
    return inputString.substring(startIndex);
}
export function cascadeOrderChange(photoCard) {
    let parentSection = photoCard.parentElement;
    let moveableCardOrder = getCardOrderField(photoCard).value;
    let allParentSectionCards = parentSection.querySelectorAll('.photo-card');
    allParentSectionCards.forEach(card => {
        if (card != photoCard) {
            const currentCardOrderField = getCardOrderField(card)
            const currentCardOrderValue = currentCardOrderField.value
            if (currentCardOrderValue >= moveableCardOrder) {
                currentCardOrderField.value = parseInt(currentCardOrderValue) - 1;
            }
        }
    })
}

function findPreviousAdditionalDivider(currentElement) {
    // Start with the previous sibling
    let previousElement = currentElement.previousElementSibling;

    // Loop until we find a match or run out of siblings
    while (previousElement) {
        // Check if the current previous sibling has the 'additional-divider' class
        if (previousElement.classList.contains('additional-divider')) {
            return previousElement; // Return the found element
        }
        // Move to the next previous sibling
        previousElement = previousElement.previousElementSibling;
    }

    // Return null if no matching element is found
    return null;
}