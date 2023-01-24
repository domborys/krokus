import { parseJwt } from './utils';
class ApiService {
    constructor() {
        this.token = this.loadToken();
        this.currentUser = null;
        this.apiPrefix = "/api";
        this.nominatimPrefix = 'https://nominatim.openstreetmap.org/search?'
    }

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

    async getCurrentUser() {
        if (this.token === null) {
            return null;
        }
        const url = this.apiPrefix + '/User/Me';
        this.currentUser = await this.fetchJson(url);
        return this.currentUser;
    }
    async logout() {
        this.token = null;
        this.currentUser = null;
        sessionStorage.removeItem('token');
    }

    async register(registerData) {
        const url = this.apiPrefix + '/User/register';
        const options = {
            method: 'POST',
            body: JSON.stringify(registerData),
        }
        const response = await this.fetchJson(url, options);
        return response;
    }

    async changePassword(passwordData) {
        const url = this.apiPrefix + '/User/ChangePassword';
        const options = {
            method: 'POST',
            body: JSON.stringify(passwordData),
        }
        await this.fetchJson(url, options);
    }

    async getObservations(params) {
        const url = this.apiPrefix + '/Observations?' + paramsToUrl(params);
        const apiObservations = await this.fetchJson(url);
        return this.prepareObservations(apiObservations);
    }

    async getObservation(id) {
        const url = this.apiPrefix + '/Observations/' + id;
        const apiObsesrvation = await this.fetchJson(url);
        return this.prepareObservation(apiObsesrvation);
    }

    async getConfirmationsOfObservation(observationId) {
        
        const searchParams = new URLSearchParams({ observationId: observationId });
        const url = this.apiPrefix + '/Confirmations?' + searchParams.toString();
        return await this.fetchJson(url);
    }

    async getConfirmation(id) {
        const url = this.apiPrefix + '/Confirmations/' + id;
        return await this.fetchJson(url);
    }

    async getConfirmations(params) {
        const url = this.apiPrefix + '/Confirmations?' + paramsToUrl(params);
        return await this.fetchJson(url);
    }

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
        return response;
    }

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

    

    async deleteObservation(id) {
        const url = this.apiPrefix + '/Observations/' + id;
        const options = {
            method: 'DELETE',
        }
        await this.fetchJson(url, options);
    }

    async postConfirmation(confirmation) {
        const url = this.apiPrefix + '/Confirmations/';
        const options = {
            method: 'POST',
            body: JSON.stringify(confirmation),
        }
        const response = await this.fetchJson(url, options);
        return response;
    }

    async putConfirmation(confirmation) {
        const url = this.apiPrefix + '/Confirmations/' + confirmation.id;
        const options = {
            method: 'PUT',
            body: JSON.stringify(confirmation),
        }
        await this.fetchJson(url, options);
    }

    async deleteConfirmation(id) {
        const url = this.apiPrefix + '/Confirmations/' + id;
        const options = {
            method: 'DELETE',
        }
        await this.fetchJson(url, options);
    }

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

    async deletePicture(id) {
        const url = this.apiPrefix + '/Pictures/' + id;
        const options = {
            method: 'DELETE',
        }
        await this.fetchJson(url, options);
    }

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

    async getUser(id) {
        const url = this.apiPrefix + '/User/' + id;
        const user = await this.fetchJson(url);
        return user;
    }

    async getUsers(params) {
        const url = this.apiPrefix + '/User?' + paramsToUrl(params);
        return await this.fetchJson(url);
    }

    async putUserRole(userId, role) {
        const url = this.apiPrefix + '/User/' + userId + '/Role';
        const body = { role };
        const options = {
            method: 'PUT',
            body: JSON.stringify(body),
        }
        await this.fetchJson(url, options);
    }

    async putUserBan(userId, banData) {
        const url = this.apiPrefix + '/User/' + userId + '/Ban';
        const options = {
            method: 'PUT',
            body: JSON.stringify(banData),
        }
        await this.fetchJson(url, options);
    }

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