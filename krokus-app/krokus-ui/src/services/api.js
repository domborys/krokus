class ApiService {
    constructor() {
        this.token = null;
        this.apiPrefix = "/api";
        this.nominatimPrefix = 'https://nominatim.openstreetmap.org/search?'
    }

    async authenticate(credentials) {
        const credentialsDto = { ...credentials };
        const url = this.apiPrefix + '/User/Login';
        const options = {
            method: 'POST',
            headers: {
                'Content-Type':'application/json',
            },
            body: JSON.stringify(credentialsDto),
        };
        const response = await fetch(url, options);
        if (response.ok) {
            this.token = await response.text();
        }
        else {
            console.log(response);
            throw new Error('Authentication failed');
        }
    }

    async getCurrentUser() {
        const url = this.apiPrefix + '/User/Me';
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.token,
            },
        };
        const response = await fetch(url, options);
        if (response.ok) {
            return await response.json();
        }
        else {
            console.log(response);
            throw new Error('Could not fetch the current user');
        }
    }
    async logout() {
        this.token = null;
    }

    async getObservations(params) {
        
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
        const url = this.apiPrefix + '/Observations?' + searchParams.toString();
        console.log(url);
        const options = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const response = await fetch(url, options);
        if (response.ok) {
            const result = await response.json();
            return this.prepareObservations(result);
        }
        else {
            console.log(response);
            throw new Error('Could not fetch observations');
        }
    }

    async getObservation(id) {
        const url = this.apiPrefix + '/Observations/' + id;
        const options = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const response = await fetch(url, options);
        console.log(response);
        if (response.ok) {
            const result = await response.json();
            return this.prepareObservation(result);
        }
        else {
            console.log(response);
            throw new Error('Could not fetch the observation');
        }
    }

    async getConfirmationsOfObservation(observationId) {
        
        const searchParams = new URLSearchParams({ observationId: observationId });
        const url = this.apiPrefix + '/Confirmations?' + searchParams.toString();
        console.log(url);
        return this.fetchJson(url);
    }

    async postObservation(observation) {
        const url = this.apiPrefix + '/Observations/';
        const observationToSend = {
            ...observation,
            location: pointLeafletToGeo(observation.location),
            boundary: pointLeafletToGeo(observation.boundary),
        }
        const options = {
            method: 'POST',
            body: JSON.stringify(observationToSend),
        }
        console.log('Request', observationToSend);
        const response = await this.fetchJson(url, options);
        console.log(response);
        return response;
    }

    async postConfirmation(confirmation) {
        const url = this.apiPrefix + '/Confirmations/';
        const options = {
            method: 'POST',
            body: JSON.stringify(confirmation),
        }
        console.log('Request', confirmation);
        const response = await this.fetchJson(url, options);
        console.log(response);
        return response;
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
            console.log(response);
            throw new Error('Could not fetch the data');
        }
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
        console.log(this.transformNominatimResponse(response));
        return this.transformNominatimResponse(response);
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
            const result = await response.json();
            return result;
        }
        else {
            console.log(response);
            throw new Error('Could not fetch the data.');
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