import {
    sorting_zone,
    getMostNestedElement,
    moveCardToAnotherZone,
    cascadeOrderChange,
    dragElement
} from '/static/admin/photo_sortzone/js/dynamic_sortzone.js';

import {
    validateYearInput
} from '/static/admin/photo_sortzone/js/validators.js';

//let dragElement = window.photoSortingZone['dragElement'];
let subcategoriesGroupElement = document.getElementById('subcategories-group');
let photoCards = document.querySelectorAll('.photo-card');
let existingSubcategoriesInTheBegin = getExistentCategoriesAndIds(); // Get dict of subcategories element and it's names
let controlPanelElement = document.querySelector('.sortzone-controlpanel');
let photoToSubcategoryMenu = document.querySelector('.photo-to-subcategory-menu');
let withoutCategoryZone = document.querySelector('.without-category');

document.addEventListener("DOMContentLoaded", () => {
    putCardsInCorrespondingSubcategories(photoCards);
    placePhotosWithoutCategoryIntoAddMenu();
    addEventListenersToButtons();
    addAditionalEventListenerForPhotoCards();
    addAditionalEventListenersForSubcategoriesElements();
    addAdditionalButtonsToDropZone();
    addAdditionalClassToDropZone();
});


function addAditionalEventListenerForPhotoCards() {
    photoCards.forEach(card =>{
        card.addEventListener('click', function(e) {
            if (e.target.closest('.without-category')) {
                if (card.classList.contains('photo-selected-to-move')) {
                    card.classList.remove('photo-selected-to-move');
                }
                else {
                    card.classList.add('photo-selected-to-move');
                }
            }
        })
    })
}


function setAppropriateDataForNewCreatedsubcategory(subcategoryElement) {
    //setAppropriateOrderValue(subcategoryElement);
    //setAppropriateIDvalue(subcategoryElement);
    AddInteractiveInputFunctionality(subcategoryElement);
}
/**
function setAppropriateIDvalue(subcategoryElement) {
    createNewELement
    getNewIdFromServer().then(newId => {
        let IDField = getSubcategoryIDField(subcategoryElement);
        IDField.value = newId; // Set the new ID value
    });
}

async function getNewIdFromServer() {
    let response = await fetch('/staff/albums/subcategorydividedalbum/get_unoccupied_id', {
        method: 'GET',
      });
    let date = await (response.json())
    let spareID = date.spare_id
    return spareID
}
*/

function addAditionalEventListenersForSubcategoriesElements() {
    existingSubcategoriesInTheBegin.forEach(subcategoryElement => {
        let innerSortzone = subcategoryElement.querySelector('.subcategory-divider')
        AddInteractiveInputFunctionality(subcategoryElement);
        AddOrderAutoSolver(innerSortzone);
        AddDropPhotoCardListener(innerSortzone);
    })
}

function AddDropPhotoCardListener(innerSortzone) {
    innerSortzone.addEventListener('dragover', (event) => {
        event.preventDefault(); // Allow drop
    });
    innerSortzone.addEventListener('drop', function(e) {
        moveCardToAnotherSubcategory(e);
    });
    
}
function AddOrderAutoSolver(innerSortzone) {
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('photo-card')) {
                        setLatestCardOrder(innerSortzone, node);
                    }
                });
            }
        }
    });
    const config = { childList: true };

    observer.observe(innerSortzone, config);
}
function moveCardToAnotherSubcategory(event) {
    let target_element = event.target
    if ((event.target.closest('.photo-card'))) {
        return
    }
    if (dragElement.closest('.additional-divider') !== target_element) {
        cascadeOrderChange(dragElement); // Change orders field in previous category
        target_element.appendChild(dragElement); // Move element to another category
        changeSubcategoryOfCardDueToSortZone(dragElement); //Change subcategory of photo-card
    }
}

function AddInteractiveInputFunctionality (subcategoryElement) {
    let inputField = subcategoryElement.querySelector(`input[name=${subcategoryElement.id}-title]`)
    let labelElement = subcategoryElement.querySelector('.inline_label');
    inputField.addEventListener('input', function() {
        let typingTimer;
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            // Display the input value in the label div
            labelElement.textContent = inputField.value;
        }, 2000);
    })
}
function setLatestCardOrder(subcategorySortzone, card) {
    let photoCards = Array.from(subcategorySortzone.querySelectorAll('.photo-card'))
    let orderValues = photoCards.map(card => {
        return parseInt(getCardOrderField(card).value); // Convert to integer
    });
    let biggestCurrentOrder = Math.max(...orderValues);
    if (biggestCurrentOrder == -Infinity) {
        biggestCurrentOrder = 0
    }
    getSubcategoryOrderField(card).value = biggestCurrentOrder + 1;
}
function addEventListenersToButtons() {
    let addPhotosToSubcategoryButton = document.querySelector('.add-photos-to-category-button');
    addPhotosToSubcategoryButton.addEventListener('click', function(e) {
        triggerAddPhotosToSubcategoryButton();
    let movePhototoSubcategoryMenuButton = document.querySelector('.move-photos-button');
    movePhototoSubcategoryMenuButton.addEventListener('click', function(e){
        triggerMovePhotostoSubcategoryMenuButton()
    });
    });
}

function triggerAddPhotosToSubcategoryButton() {
    let select_options = getExistentCategories();
    openSetCategoryForPhotosMenu(select_options);
}

function triggerMovePhotostoSubcategoryMenuButton() {
    const selectedSubcategory = document.getElementById('select-category-to-move-in').value;
    let selectedPhotos = withoutCategoryZone.querySelectorAll('.photo-selected-to-move');
    let select_options = getExistentCategories();
    let subcategoryElement=(select_options.get(selectedSubcategory))
    let subcategoryPhotoZone = subcategoryElement.querySelector('.additional-divider')
    selectedPhotos.forEach(photo => {
        photo.classList.remove('photo-selected-to-move');
        subcategoryPhotoZone.appendChild(photo);
        changeSubcategoryOfCardDueToSortZone(photo);
    })
}

function openSetCategoryForPhotosMenu(select_options) {
    formSelectOptionForPhotosMenu(Array.from(select_options.keys()));
    photoToSubcategoryMenu.style.display = 'block';

    let closeButton = photoToSubcategoryMenu.querySelector(".close-button");

    closeButton.onclick = function() {
        photoToSubcategoryMenu.style.display = "none";
    }
 
     // Close the modal when clicking outside of the modal content
    window.onclick = function(event) {
        if (event.target == photoToSubcategoryMenu) {
            photoToSubcategoryMenu.style.display = "none";
        }
    }
}

function formSelectOptionForPhotosMenu (subcategoriesNames) {
    let selectElement = document.getElementById('select-category-to-move-in');
    selectElement.innerHTML = ''
    subcategoriesNames.forEach(subcategoryName => {
        let newOption = document.createElement('option');
        newOption.innerHTML = (subcategoryName);
        selectElement.appendChild(newOption);
    })
}
function placePhotosWithoutCategoryIntoAddMenu() {
    let photosWithoutCategory = document.querySelector('.without-category');
    (photoToSubcategoryMenu.querySelector('.modal-menu-content')).insertAdjacentElement('beforeend',photosWithoutCategory);
}
function getExistentCategoriesAndIds() {
    let subcategoriesElements = subcategoriesGroupElement.querySelectorAll('div[id*="subcategories"]')
    subcategoriesElements = Array.from(subcategoriesElements).filter(div => {
        const id = div.id; 
        return id.includes('subcategories-') && id !== 'subcategories-empty'; 
    });
    let subcategoriesAndItsIDs = new Map();
    subcategoriesElements.forEach(subcategoryElement => {
        let currentSubcategoryID = getSubcategoryID(subcategoryElement);
        subcategoriesAndItsIDs.set(currentSubcategoryID, subcategoryElement);
    })
    return subcategoriesAndItsIDs
}

function getExistentCategories() {
    let subcategoriesElements = subcategoriesGroupElement.querySelectorAll('div[id*="subcategories"]')
    subcategoriesElements = Array.from(subcategoriesElements).filter(div => {
        const id = div.id; 
        return id.includes('subcategories-') && id !== 'subcategories-empty'; 
    });
    let subcategoriesAndItsNames = new Map();
    subcategoriesElements.forEach(subcategoryElement => {
        let currentSubcategoryName = getSubcategoryName(subcategoryElement);
        subcategoriesAndItsNames.set(currentSubcategoryName.trim(), subcategoryElement);
    })
    return subcategoriesAndItsNames
}

function getExistentCategoriesNamesAndItsIDs() {
    let subcategoriesElements = subcategoriesGroupElement.querySelectorAll('div[id*="subcategories"]')
    subcategoriesElements = Array.from(subcategoriesElements).filter(div => {
        const id = div.id; 
        return id.includes('subcategories-') && id !== 'subcategories-empty'; 
    });
    let subcategoriesAndItsNames = new Map();
    subcategoriesElements.forEach(subcategoryElement => {
        let currentSubcategoryName = getSubcategoryName(subcategoryElement);
        let currentSubcategoryID = getSubcategoryID(subcategoryElement)
        subcategoriesAndItsNames.set(currentSubcategoryName.trim(), currentSubcategoryID);
    })
    return subcategoriesAndItsNames
}

function getSubcategoryID(subcategoryElement) {
    let subcategoryID = (document.getElementsByName(`${subcategoryElement.id}-id`)[0]).value
    return subcategoryID
}

function getSubcategoryIDField(subcategoryElement) {
    let subcategoryID = (document.getElementsByName(`${subcategoryElement.id}-id`)[0])
    return subcategoryID
}

function getSubcategoryName(subcategoryElement) {
    let subcategoryName = ((subcategoryElement.querySelector('.inline_label')).textContent)
    return subcategoryName
}
function getSubcategoryOrder(subcategoryElement) {
    let subcategoryOrder = subcategoryElement.querySelector('.field-order').querySelector('input').value
    return subcategoryOrder
}
function getSubcategoryOrderField(subcategoryElement) {
    let subcategoryOrder = subcategoryElement.querySelector('.field-order').querySelector('input')
    return subcategoryOrder
}
function getCardSubcategoryField(card) {
    return getMostNestedElement(card.querySelector(".field-subcategory"))
};

function getCardOrderField(card) {
    return getMostNestedElement(card.querySelector(".field-order"));
};

function putCardsInCorrespondingSubcategories(photoCards) {
    photoCards.forEach(card => {
        let cardSubcategory = getCardSubcategoryField(card).value;
        if (existingSubcategoriesInTheBegin.has(cardSubcategory) && (cardSubcategory != '')) {
            existingSubcategoriesInTheBegin.get(cardSubcategory).querySelector('.subcategory-divider').appendChild(card)
        }
    })
}

function changeSubcategoryOfCardDueToSortZone(card) {
    let subcategoryID  = getSubcategoryID(card.closest('.subcategory-element'));
    let SubcategoryField = getCardSubcategoryField(card);
    SubcategoryField.value = subcategoryID
};

function addAdditionalButtonsToDropZone() {
    let dropzoneControllerElement = document.querySelector('.dropzone-controller');
    let additionalButtons = `<span class='dropzone-select-instruction'> Select the subcategory you want to upload photos to </span>
        <select id="dropzone-select">
        <option value=''>Without category</option>
         </select>
    `
    dropzoneControllerElement.insertAdjacentHTML('beforeend',additionalButtons);
    formSelectOptionsForDropzoneSelect(dropzoneControllerElement.querySelector('#dropzone-select'),
                                                getExistentCategoriesNamesAndItsIDs());
}
function formSelectOptionsForDropzoneSelect (selectElement, selectOptions) {
        selectOptions.forEach((id, name) => {
        let newOption = document.createElement('option');
        newOption.innerHTML = (name);
        newOption.value = id
        selectElement.appendChild(newOption);
    })
}

function addAdditionalClassToDropZone() {
    let selectElement = document.querySelector('#dropzone-select');
    selectElement.classList.add('subcategory-select');
}