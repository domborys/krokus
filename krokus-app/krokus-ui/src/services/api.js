class ApiService {
    constructor() {
        this.token = null;
        this.apiPrefix = "api";
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
};

const apiService = new ApiService();
export { ApiService, apiService };