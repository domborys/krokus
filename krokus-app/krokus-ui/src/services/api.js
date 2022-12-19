class ApiService {
    constructor() {
        this.token = null;
        this.apiPrefix = "/api";
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
        console.log(url);
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

    async fetchJson(url, options = {}) {
        let headers = {
            'Content-Type': 'application/json',
        };
        if (this.token !== null) {
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
            throw new Error('Could not fetch the observation');
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
};

function makeNewLocation(oldLocation) {
    return [oldLocation.coordinates[1], oldLocation.coordinates[0]];
}

function makeNewBoundary(oldBoundary) {
    if (oldBoundary === null)
        return null;
    return oldBoundary.coordinates[0].slice(0,-1).map(coord => [coord[1], coord[0]]);
}

const apiService = new ApiService();
export { ApiService, apiService };