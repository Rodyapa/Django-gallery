window.photoSortingZone = {
    'sorting_zone': null
    };

export let sorting_zone = window.photoSortingZone['sorting_zone'];

document.addEventListener("DOMContentLoaded", () => {
    sorting_zone = document.querySelector('.sorting-zone');
    let dragElement = null;
    let orderChanged = false;

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
            orderChanged = true;
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
            dragElement=null;
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