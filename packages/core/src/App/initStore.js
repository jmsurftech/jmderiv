import { configure } from 'mobx';

import NetworkMonitor from 'Services/network-monitor';
import { getStoredToken } from 'Services/oauth';
import RootStore from 'Stores';

configure({ enforceActions: 'observed' });

const setStorageEvents = root_store => {
    window.addEventListener('storage', evt => {
        switch (evt.key) {
            case 'client.accounts': {
                const active_loginid = root_store.client.loginid;
                const new_currency = JSON.parse(evt.newValue)?.[active_loginid]?.currency;
                const old_currency = JSON.parse(evt.oldValue)?.[active_loginid]?.currency;

                if (document.hidden && new_currency && old_currency !== new_currency) {
                    root_store.client.updateAccountCurrency(new_currency, false);
                }
                break;
            }
            case 'active_loginid':
                if (localStorage.getItem('active_loginid') === 'null' || !localStorage.getItem('active_loginid')) {
                    root_store.client.logout();
                }
                if (document.hidden) {
                    window.location.reload();
                }
                break;
            // Cross-tab logout sentinel: logout.js writes this key on logout
            case 'logout_event':
                if (evt.newValue) {
                    root_store.client.logout();
                }
                break;
            // no default
        }
    });
};

const initStore = async notification_messages => {
    const url_query_string = window.location.search;
    const url_params = new URLSearchParams(url_query_string);

    if (url_params.get('action') === 'signup') {
        // If a user comes from the signup process, give them a clean setup
        const server_url = localStorage.getItem('config.server_url');
        localStorage.clear();
        if (server_url) localStorage.setItem('config.server_url', server_url);
    }

    // v4 auth: token presence replaces the whoami pre-flight check.
    // getStoredToken() returns null if no token or if the token is expired.
    // When null, the socket layer will open the public WS endpoint automatically.
    const has_valid_token = !!getStoredToken();

    // external_id is no longer needed (was populated by whoami response).
    // Pass undefined so client.init() signature is unchanged.
    const external_id = undefined;

    const root_store = new RootStore();

    // Set up global store reference for debugging
    if (typeof window !== 'undefined') {
        window.__deriv_store = root_store;
    }

    setStorageEvents(root_store);

    // Only initialise NetworkMonitor (which opens the WebSocket) when we have
    // a valid token or the user is public — safe to proceed in both cases.
    NetworkMonitor.init(root_store);
    root_store.client.init(external_id, has_valid_token);
    root_store.common.init();
    root_store.ui.init(notification_messages);

    return root_store;
};

export default initStore;
