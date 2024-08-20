import {
    sorting_zone,
    getMostNestedElement,
    moveCardToAnotherZone
} from '/static/admin/photo_sortzone/js/dynamic_sortzone.js';
import {
    validateYearInput
} from '/static/admin/photo_sortzone/js/validators.js';

let dragElement = window.photoSortingZone['dragElement'];


document.addEventListener("DOMContentLoaded", () => {
    loadPhotosBySubcategories();    
});


function loadPhotosBySubcategories() {
    let photo_cards = Array.from(sorting_zone.querySelectorAll('.photo-card'));
    let category_sorting_zones = new Map();
    category_sorting_zones.set('without category', new Array);

    let existedCategoriesZones = sorting_zone.querySelectorAll(`.subcategory-divider`)
    for (let categoryZone of existedCategoriesZones) {
        categoryZone.style.display = 'flex';
    }

    photo_cards.forEach(photo_card => {
        let photo_subcategory = getMostNestedElement(photo_card.querySelector('.field-subcategory')).value
        if (photo_subcategory == "") {
            photo_subcategory = 'without category'
        } 
        if (!category_sorting_zones.has(photo_subcategory)) {
            category_sorting_zones.set(photo_subcategory, [photo_card]);
        } else {
            category_sorting_zones.get(photo_subcategory).push(photo_card);
        }
    });

    category_sorting_zones.forEach((photo_array, subcategory) => {
        let subcategorySortingZone = document.getElementById(`subcategory-${subcategory.replace(/ /g, '-')}`);
        if (!subcategorySortingZone) {
            subcategorySortingZone = document.createElement('div');
            subcategorySortingZone.classList.add('additional-divider', 'subcategory-divider');
            subcategorySortingZone.id = (`subcategory-${subcategory.replace(/ /g, '-')}`);
            subcategorySortingZone.innerHTML = `<h3 class="subcategory-header divider-header">${subcategory}</h3>`;
            sorting_zone.appendChild(subcategorySortingZone);
            subcategorySortingZone.addEventListener('dragover', (event) => {
               event.preventDefault(); // Allow drop
           });
            subcategorySortingZone.addEventListener('drop', moveCardToAnotherZone);
        }
        photo_array.forEach(photo_card => {
            subcategorySortingZone.appendChild(photo_card);
        })    
    })

    //add 'add' button for ability to make new subcategory
    let addSubcategoryButton = sorting_zone.querySelector('.additional-button.add-subcategory')
    if (addSubcategoryButton) {
        addSubcategoryButton.style.display = 'flex';
    }
    else {
        sorting_zone.insertAdjacentHTML('afterbegin',
            '<input class="additional-button add-subcategory" type="button" value="Add Subcategory" name="_add_subcategory">'
        )
        addSubcategoryButton = sorting_zone.querySelector('.additional-button.add-subcategory')
        addSubcategoryButton.addEventListener('click', triggerSubcategoryButton);
    }
};




function createYearDividerMoverElement() {
    let upArrowElement = document.createElement('span');
    upArrowElement.innerHTML = '&uarr;';
    upArrowElement.addEventListener('click', moveDividerUp);
    let downArrowElement = document.createElement('span');
    downArrowElement.innerHTML = '&darr;';
    downArrowElement.addEventListener('click', moveDividerDown);
    let YearDividerMoverElement = document.createElement('div');
    YearDividerMoverElement.classList.add('divider-mover');
    YearDividerMoverElement.appendChild(upArrowElement);
    YearDividerMoverElement.appendChild(downArrowElement);
    return YearDividerMoverElement
};


function moveDividerUp(){
    alert(up);
};
    
function moveDividerDown() {
    alert(down);
};