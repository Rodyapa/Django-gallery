window.photoSortingZone = {
    'sorting_zone': null,
    'dragElement': null
};

export let sorting_zone = window.photoSortingZone['sorting_zone'];
export let dragElement = window.photoSortingZone['dragElement']; 

document.addEventListener("DOMContentLoaded", () => {
    sorting_zone = document.querySelector('.sorting-zone');
    const photoCards = document.querySelectorAll('.photo-card');
    const form = document.querySelector('#album_form');
    const submitButton = form.querySelector(
        'input[type=submit], button[type=submit]'
    );

    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent form from submitting
        SetOrderValuesForPhotoCards();
        form.submit();
    });

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

function sortPhotoCards(dragged_card, target_card) {
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
            target_card.after(dragged_card);
        } else {
            parentElementOfCards.insertBefore(dragged_card, target_card);
        }
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

function SetOrderValuesForPhotoCards() {
    const photoCards = document.querySelectorAll('.photo-card');
    let order_value = 1;
    photoCards.forEach(photoCard => {
        let order_field = getCardOrderField(photoCard);
        order_field.value = order_value++
    })
}