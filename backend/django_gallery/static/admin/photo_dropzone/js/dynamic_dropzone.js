
import {
    getMostNestedElement,
    sorting_zone
} from '/static/admin/js/drag_sort.js';


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
            yearSortingZone.classList.add('addtitional-divider', 'year-divider');
            yearSortingZone.innerHTML = `<h3 class="year-header">${year}</h3>`;

            sorting_zone.appendChild(yearSortingZone);
        }
        photo_array.forEach(photo_card => {
            yearSortingZone.appendChild(photo_card);
        })          
    });
};

function loadRegularTemplate() {
    // Delete all year-headers 

    //delete additional dividing divs in sorting zone. "Unpack" all photo-cards
    //into main sorting zone.
    let additionalDividers = sorting_zone.querySelectorAll('.addtitional-divider');

    for (let divider of additionalDividers) {
        let relatedPhotoCards = divider.querySelectorAll('div.photo-card');
        relatedPhotoCards.forEach(card => sorting_zone.append(card));
        divider.style.display = 'none';
    };
};
