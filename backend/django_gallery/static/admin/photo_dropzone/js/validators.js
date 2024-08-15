// Validate that Subcategory name consistent only Russian and English letters
//and arabic numbers
export function validateSubcategoryName(input){
    const regex = /^[A-Za-zА-Яа-я0-9\s]+$/;
    return regex.test(input);
};
