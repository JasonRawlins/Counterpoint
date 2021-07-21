"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("bootstrap/dist/css/bootstrap.css");
var React = require("react");
var ReactDOM = require("react-dom");
var react_redux_1 = require("react-redux");
var connected_react_router_1 = require("connected-react-router");
var history_1 = require("history");
var configureStore_1 = require("./store/configureStore");
var App_1 = require("./App");
// Create browser history to use in the Redux store
var baseUrl = document.getElementsByTagName('base')[0].getAttribute('href');
var history = history_1.createBrowserHistory({ basename: baseUrl });
// Get the application-wide store instance, prepopulating with state from the server where available.
var store = configureStore_1.default(history);
ReactDOM.render(React.createElement(react_redux_1.Provider, { store: store },
    React.createElement(connected_react_router_1.ConnectedRouter, { history: history },
        React.createElement(App_1.default, null))), document.getElementById('root'));
// Uncomment the line above that imports the registerServiceWorker function
// and the line below to register the generated service worker.
// By default create-react-app includes a service worker to improve the
// performance of the application by caching static assets. This service
// worker can interfere with the Identity UI, so it is
// disabled by default when Identity is being used.
//
//registerServiceWorker();
//# sourceMappingURL=index.js.map