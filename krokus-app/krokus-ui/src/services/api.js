import { parseJwt } from './utils';

/**
 * A service for accessing the API of the app.*/
class ApiService {
    /**
     * Initializes the service.
     */
    constructor() {
        this.token = this.loadToken();
        this.currentUser = null;
        this.apiPrefix = "/api";
        this.nominatimPrefix = 'https://nominatim.openstreetmap.org/search?'
    }

    /**
     * Gets the API token from the session storage.
     */
    loadToken() {
        const sessionToken = sessionStorage.getItem('token');
        if (sessionToken === null) {
            return null;
        }
        const tokenData = parseJwt(sessionToken);
        if (tokenData.exp > Date.now() / 1000) {
            return sessionToken;
        }
        else {
            return null;
        }
    }

    /**
     * Authenticate the user at the API.
     * The API token is then saved in the service and used for future requests.
     * @param {any} credentials username and password.
     */
    async authenticate(credentials) {
        const credentialsDto = { ...credentials };
        const url = this.apiPrefix + '/User/Login';
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentialsDto),
        };
        const response = await fetch(url, options);
        if (response.ok) {
            this.token = await response.text();
            sessionStorage.setItem('token', this.token);
        }
        else {
            const msg = await this.getResponseErrorMessage(response);
            throw new Error(msg ?? 'Nieznany b³¹d serwera.');
        }

    }

    /**
     * Gets the currently logged-in user.
     */
    async getCurrentUser() {
        if (this.token === null) {
            return null;
        }
        const url = this.apiPrefix + '/User/Me';
        this.currentUser = await this.fetchJson(url);
        return this.currentUser;
    }
    /**
     * Logs out (deletes the token)
     */
    async logout() {
        this.token = null;
        this.currentUser = null;
        sessionStorage.removeItem('token');
    }

    /**
     * Posts a register request.
     * @param {any} registerData data required for registration.
     */
    async register(registerData) {
        const url = this.apiPrefix + '/User/register';
        const options = {
            method: 'POST',
            body: JSON.stringify(registerData),
        }
        const response = await this.fetchJson(url, options);
        return response;
    }

    /**
     * Changes current user's password.
     * @param {any} passwordData the old and the new password.
     */
    async changePassword(passwordData) {
        const url = this.apiPrefix + '/User/ChangePassword';
        const options = {
            method: 'POST',
            body: JSON.stringify(passwordData),
        }
        await this.fetchJson(url, options);
    }

    /**
     * Gest observations which match the params.
     * @param {any} params params describing the observations.
     */
    async getObservations(params) {
        const url = this.apiPrefix + '/Observations?' + paramsToUrl(params);
        const apiObservations = await this.fetchJson(url);
        return this.prepareObservations(apiObservations);
    }

    /**
     * Gets an observation by id.
     * @param {any} id id of the observation.
     */
    async getObservation(id) {
        const url = this.apiPrefix + '/Observations/' + id;
        const apiObsesrvation = await this.fetchJson(url);
        return this.prepareObservation(apiObsesrvation);
    }

    /**
     * Gets the confirmations of the observation with the supplied id.
     * @param {any} observationId id of the observation.
     */
    async getConfirmationsOfObservation(observationId) {
        
        const searchParams = new URLSearchParams({ observationId: observationId });
        const url = this.apiPrefix + '/Confirmations?' + searchParams.toString();
        return await this.fetchJson(url);
    }

    /**
     * Gets a confirmation by id.
     * @param {any} id id of the confirmation.
     */
    async getConfirmation(id) {
        const url = this.apiPrefix + '/Confirmations/' + id;
        return await this.fetchJson(url);
    }

    /**
     * Gets confirmations using search params.
     * @param {any} params params describing the confirmations.
     */
    async getConfirmations(params) {
        const url = this.apiPrefix + '/Confirmations?' + paramsToUrl(params);
        return await this.fetchJson(url);
    }

    /**
     * Posts a new observation.
     * @param {any} observation the observation to post.
     */
    async postObservation(observation) {
        const url = this.apiPrefix + '/Observations/';
        const observationToSend = {
            ...observation,
            location: pointLeafletToGeo(observation.location),
            boundary: polygonLeafletToGeo(observation.boundary),
        }
        const options = {
            method: 'POST',
            body: JSON.stringify(observationToSend),
        }
        const response = await this.fetchJson(url, options);
        return this.prepareObservation(response);
    }

    /**
     * Puts a new version of the observation.
     * @param {any} observation the new version of the observation.
     */
    async putObservation(observation) {
        const url = this.apiPrefix + '/Observations/' + observation.id;
        const observationToSend = {
            ...observation,
            location: pointLeafletToGeo(observation.location),
            boundary: polygonLeafletToGeo(observation.boundary),
        }
        const options = {
            method: 'PUT',
            body: JSON.stringify(observationToSend),
        }
        await this.fetchJson(url, options);
    }

    
    /**
     * Deletes an observation.
     * @param {any} id id of the observation.
     */
    async deleteObservation(id) {
        const url = this.apiPrefix + '/Observations/' + id;
        const options = {
            method: 'DELETE',
        }
        await this.fetchJson(url, options);
    }

    /**
     * Posts a new confirmation.
     * @param {any} confirmation the confirmation to add.
     */
    async postConfirmation(confirmation) {
        const url = this.apiPrefix + '/Confirmations/';
        const options = {
            method: 'POST',
            body: JSON.stringify(confirmation),
        }
        const response = await this.fetchJson(url, options);
        return response;
    }

    /**
     * Puts a new version of the confirmation.
     * @param {any} confirmation the new version of the confirmation.
     */
    async putConfirmation(confirmation) {
        const url = this.apiPrefix + '/Confirmations/' + confirmation.id;
        const options = {
            method: 'PUT',
            body: JSON.stringify(confirmation),
        }
        await this.fetchJson(url, options);
    }

    /**
     * Deletes a confirmation.
     * @param {any} id id of the confirmation.
     */
    async deleteConfirmation(id) {
        const url = this.apiPrefix + '/Confirmations/' + id;
        const options = {
            method: 'DELETE',
        }
        await this.fetchJson(url, options);
    }

    /**
     * Posts pictures related to a confirmation.
     * @param {any} confirmationId id of the confirmation.
     * @param {any} files picture files.
     */
    async postPictures(confirmationId, files) {
        const formData = new FormData();
        formData.append('confirmationId', confirmationId);
        files.forEach(file => formData.append('files', file));
        const url = this.apiPrefix + '/Pictures';
        const response  = await fetch(url, {
            headers: {
                'Authorization': 'Bearer ' + this.token,
            },
            method: 'POST',
            body: formData,
        });
        if (response.ok) {
            const result = await response.json();
            return result;
        }
        else {
            throw new Error('Could not fetch the data');
        }
    }

    /**
     * Deletes a picture.
     * @param {any} id id of the picture.
     */
    async deletePicture(id) {
        const url = this.apiPrefix + '/Pictures/' + id;
        const options = {
            method: 'DELETE',
        }
        await this.fetchJson(url, options);
    }

    /**
     * Gets tags by the params.
     * @param {any} params params describing the tags.
     */
    async getTags(params) {
        const url = this.apiPrefix + '/Tags?' + paramsToUrl(params);
        return await this.fetchJson(url);
    }

    /**
     * Gueries the nominatim api for a place by name.
     * @param {any} placeQuery query describing the place.
     */
    async getPlace(placeQuery) {
        const params = {
            'q': placeQuery,
            'format': 'jsonv2',
            'polygon_geojson': '1',
        };
        const searchParams = new URLSearchParams(params);
        const url = this.nominatimPrefix + searchParams;
        const response = await this.fetchJson(url, {}, false);
        return this.transformNominatimResponse(response);
    }

    /**
     * Gets a user by id.
     * @param {any} id user's id.
     */
    async getUser(id) {
        const url = this.apiPrefix + '/User/' + id;
        const user = await this.fetchJson(url);
        return user;
    }

    /**
     * Gets users with using the params.
     * @param {any} params params describing the users.
     */
    async getUsers(params) {
        const url = this.apiPrefix + '/User?' + paramsToUrl(params);
        return await this.fetchJson(url);
    }

    /**
     * Sets the role of the user.
     * @param {any} userId user's id.
     * @param {any} role user's new role.
     */
    async putUserRole(userId, role) {
        const url = this.apiPrefix + '/User/' + userId + '/Role';
        const body = { role };
        const options = {
            method: 'PUT',
            body: JSON.stringify(body),
        }
        await this.fetchJson(url, options);
    }

    /**
     * Sets or lifts user's ban.
     * @param {any} userId id of the user.
     * @param {any} banData data describing the ban.
     */
    async putUserBan(userId, banData) {
        const url = this.apiPrefix + '/User/' + userId + '/Ban';
        const options = {
            method: 'PUT',
            body: JSON.stringify(banData),
        }
        await this.fetchJson(url, options);
    }

    /**
     * Helper method for fetching data.
     * @param {any} url url to fetch.
     * @param {any} options options (the same as for native fetch).
     * @param {any} sendToken true if the token should be sent (default is true).
     */
    async fetchJson(url, options = {}, sendToken = true) {
        let headers = {
            'Content-Type': 'application/json',
        };
        if (sendToken && this.token !== null) {
            headers['Authorization'] = 'Bearer ' + this.token;
        }
        if (options.headers) {
            Object.assign(headers, options.headers);
        }
        const allOptions = {
            headers,
            ...options
        };
        const response = await fetch(url, allOptions);
        if (response.ok) {
            if (response.status === 204) {
                return;
            }
            else {
                const result = await response.json();
                return result;
            }
        }
        else {
            const msg = await this.getResponseErrorMessage(response);
            throw new Error(msg ?? 'Nieznany b³¹d serwera.');
        }
        
    }


    async getResponseErrorMessage(response) {
        try {
            const json = await response.json();
            return json.title ?? null;
        }
        catch (e) {
            return null;
        }
    }

    getPictureUrl(id) {
        return this.apiPrefix + '/Pictures/' + id + '/Contents';
    }

    prepareObservation(apiObs) {
        return {
            ...apiObs,
            location: makeNewLocation(apiObs.location),
            boundary: makeNewBoundary(apiObs.boundary),
        }
    }

    prepareObservations(apiObs) {
        return {
            ...apiObs,
            items: apiObs.items.map(item => ({
                ...item,
                location: makeNewLocation(item.location),
                boundary: makeNewBoundary(item.boundary),
            })),
        };
    }

    transformNominatimPlace(place) {
        const leaflet = {
            type: place.geojson.type,
            coordinates: geoToLeaflet(place.geojson),
        }
        return {
            ...place,
            leaflet
        }
    }

    transformNominatimResponse(response) {
        return response.map(place => this.transformNominatimPlace(place));
    }
};

function paramsToUrl(params) {
    const searchParams = new URLSearchParams();
    for (const name in params) {
        const value = params[name];
        if (Array.isArray(value)) {
            value.forEach(el => searchParams.append(name, el));
        }
        else {
            searchParams.append(name, value);
        }
    }
    return searchParams.toString();
}

function geoToLeaflet(geoJson) {
    if (!geoJson) {
        return null;
    }
    if (geoJson.type === 'Point') {
        return [geoJson.coordinates[1], geoJson.coordinates[0]]
    }
    else {
        return geoJson.coordinates[0].slice(0, -1).map(coord => [coord[1], coord[0]]);
    }
}

function makeNewLocation(oldLocation) {
    return [oldLocation.coordinates[1], oldLocation.coordinates[0]];
}

function makeNewBoundary(oldBoundary) {
    if (oldBoundary === null)
        return null;
    return oldBoundary.coordinates[0].slice(0,-1).map(coord => [coord[1], coord[0]]);
}

function pointLeafletToGeo(pointLeaflet) {
    if (!pointLeaflet)
        return null;
    return {
        type: 'Point',
        coordinates: [pointLeaflet[1], pointLeaflet[0]],
    };
}

function polygonLeafletToGeo(polygonLeaflet) {
    if (!polygonLeaflet)
        return null;
    const polygonClosed = polygonLeaflet.concat([polygonLeaflet[0]]);
    return {
        type: 'Polygon',
        coordinates: [polygonClosed.map(coord => [coord[1], coord[0]])],
    };
}

const apiService = new ApiService();
export { ApiService, apiService };