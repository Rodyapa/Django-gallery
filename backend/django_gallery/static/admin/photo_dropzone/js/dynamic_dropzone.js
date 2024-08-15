
import {
    getMostNestedElement,
    sorting_zone
} from '/static/admin/js/drag_sort.js';

import {
    validateSubcategoryName
} from '/static/admin/photo_dropzone/js/validators.js';

let templateChoices;

document.addEventListener("DOMContentLoaded", () => {
   let templateSelectField = document.querySelector('#id_template')

   templateChoices = setInitTemplateChoices(templateSelectField);
   setTemplateAppearance(templateSelectField.value); // Initialy set template for sorting zone
   templateSelectField.addEventListener('change', () => { 
    setTemplateAppearance(
    templateSelectField.value)}); 
});

/**
 * Function makes map objects with int values of template Select Field and 
 * coresponding text descriptions and "template load functions". Function needed for make code in this module 
 * less complicated.
 */
function setInitTemplateChoices(select_field) {
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

function setTemplateAppearance(selected_template) {
    let functionToLoad = templateChoices.get(selected_template)['template_load_func'];
    functionToLoad();
};

function loadPhotosByYearTemplate() {
    loadRegularTemplate();
    let photo_cards = Array.from(sorting_zone.querySelectorAll('.photo-card'));
    let year_sorting_zones = new Map();
    let current_year = (new Date(Date.now()).getFullYear()).toString();
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
            yearSortingZone.classList.add('additional-divider', 'year-divider');
            yearSortingZone.innerHTML = `<h3 class="year-header divider-header">${year}</h3>`;

            sorting_zone.appendChild(yearSortingZone);
        }
        photo_array.forEach(photo_card => {
            yearSortingZone.appendChild(photo_card);
        })          
    });
};

function loadPhotosBySubcategories() {
    loadRegularTemplate();
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
        let subcategorySortingZone = sorting_zone.querySelector(`.name-${subcategory.replace(/ /g, '-')}`)
        if (!subcategorySortingZone) {
            subcategorySortingZone = document.createElement('div');
            subcategorySortingZone.classList.add('additional-divider', 'subcategory-divider', `name-${subcategory.replace(/ /g, '-')}`);
            subcategorySortingZone.innerHTML = `<h3 class="subcategory-header divider-header">${subcategory}</h3>`;
            sorting_zone.appendChild(subcategorySortingZone);
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
    let addSubcategoryButton = sorting_zone.querySelector('.add-subcategory');
    let newSubcategory = document.createElement('div');
    newSubcategory.classList.add('additional-divider', 'subcategory-divider', `name-${subcategoryName.replace(/ /g, '-')}`);
    newSubcategory.innerHTML = `<h3 class='subcategory-header divider-header'>${subcategoryName}</h3>`;
    addSubcategoryButton.insertAdjacentHTML('afterend', newSubcategory.outerHTML);
};

