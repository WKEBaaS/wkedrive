import { getContext, setContext } from 'svelte';

export interface NavItem {
	name: string;
	href: string;
}

export class OrgHeaderStore {
	orgName: string = $state('');
	navItems: NavItem[] = $state([]);

	constructor(orgName: string) {
		this.orgName = orgName;
	}

	setOrgName(name: string) {
		this.orgName = name;
	}

	setNavItems(links: NavItem[]) {
		this.navItems = links;
	}
}

const ORG_HEADER_STORE_KEY = Symbol('OrgHeaderStore');

export function setOrgHeaderStore(store: OrgHeaderStore, key = ORG_HEADER_STORE_KEY) {
	setContext(key, store);
}

export function getOrgHeaderStore(key = ORG_HEADER_STORE_KEY): OrgHeaderStore {
	return getContext(key);
}
