function deepParseFloat(val) {
    if (Array.isArray(val))
        return val.map(deepParseFloat);
    else
        return parseFloat(val);
}

function deepToString(val) {
    if (Array.isArray(val))
        return val.map(deepToString);
    else {
        try {
            return val.toString();
        }
        catch (e) {
            return '';
        }
    }   
}

function isValidPassword(password) {
    const requirements = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/];
    const minLength = 6;
    return password.length >= minLength && requirements.every(req => req.test(password));
}

function isValidEmail(email) {
    const regex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return email.match(regex);
}

//https://stackoverflow.com/a/38552302
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

export { deepParseFloat, deepToString, isValidPassword, isValidEmail, parseJwt };