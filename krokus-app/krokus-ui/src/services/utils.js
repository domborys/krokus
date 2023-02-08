import { format } from 'date-fns';
import L from 'leaflet';

/**
 * Parses as float the value or all values in an array and its subarrays.
 * @param {any} val the value to parse.
 */
function deepParseFloat(val) {
    if (Array.isArray(val))
        return val.map(deepParseFloat);
    else
        return parseFloat(val);
}

/**
 * Converts to string the value all all values in an array and its subarrays.
 * @param {any} val the value to convert.
 */
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

/**
 * Check if the value or any value in the array and its subarrays is NaN.
 * @param {any} val the value to check.
 */
function deepIsNaN(val) {
    if (Array.isArray(val)) {
        return val.some(deepIsNaN);
    }
    else {
        return isNaN(val);
    }
}

/**
 * Checks if a password is valid.
 * @param {any} password the password to check.
 */
function isValidPassword(password) {
    const requirements = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/];
    const minLength = 6;
    return password.length >= minLength && requirements.every(req => req.test(password));
}

/**
 * Checks if an email address is valid.
 * @param {any} email the email address is valid.
 */
function isValidEmail(email) {
    const regex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return email.match(regex);
}

/**
 * returns a pretty name of a role.
 * @param {any} role  the role.
 */
function rolePrettyName(role) {
    const roles = {
        user: 'użytkownik',
        moderator: 'moderator',
        admin: 'administrator'
    };
    return roles[role.toLowerCase()];
}

function formatDatetime(isoDate) {
    return format(new Date(isoDate), 'H:mm dd.MM.y');
}

/**
 * Adds a padding to bounds in meters.
 * @param {any} bounds the bounds to pad.
 * @param {any} meters the width of the padding in meters.
 */
function padMeters(bounds, meters) {
    const corners = [bounds.getNorthEast(), bounds.getSouthEast(), bounds.getSouthWest(), bounds.getNorthWest()];
    const cornerBounds = corners.map(corner => corner.toBounds(meters));
    const newBounds = L.latLngBounds(bounds.getSouthWest(), bounds.getNorthEast());
    cornerBounds.forEach(cb => newBounds.extend(cb));
    return newBounds;
}

/**
 * Parses a JWT token.
 * From https://stackoverflow.com/a/38552302
 * @param {any} token the token to parse.
 */
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

export { deepParseFloat, deepToString, deepIsNaN, isValidPassword, isValidEmail, parseJwt, rolePrettyName, formatDatetime, padMeters };