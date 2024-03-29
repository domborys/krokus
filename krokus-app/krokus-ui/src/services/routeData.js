import { matchPath } from 'react-router-dom';
/**
 * Class providing some information about paths.*/
class RouteData {
    constructor(paths) {
        this.paths = paths;
    }
    /**
     * Finds the name of the provided path.
     * @param {any} path
     */
    findRouteName(path) {
        const [key] = Object.entries(this.paths).find(([, value]) => !!matchPath({ path: value }, path)) ?? [undefined];
        return key;
    }
}

const paths = {
    observationSearch: '/map',
    observationList: '/map/results',
    observation: '/map/observations/:id',
    observationAdd: '/map/observations-add',
    confirmationAdd: '/map/confirmations-add',
    observationEdit: '/map/observations-edit/:id',
    confirmationEdit: '/map/confirmations-edit/:id',
    placeSearch: '/map/place-search',
};

const routeData = new RouteData(paths);
export default routeData;