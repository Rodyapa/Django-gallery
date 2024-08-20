export function validateYearInput(input, existentYears) {
    let errorMessage;
    if (input == "") {
        errorMessage = 'You must define year';
        return errorMessage
    }
    else if (existentYears.includes(input)) {
        errorMessage = 'This year already exist';
    }
    else if (!validateYearRegex(input)) {
        errorMessage = ('Year must be a valid number. You need to use arabic numbers');
    }
    if (errorMessage) {
        return errorMessage
    }
    return true    
}

function validateYearRegex(input) {
    const regex = /^(19|20){1}[0-9]{2}$/;
    return regex.test(input);
}