import { GatewayApiClient, GatewayStatusResponse, State, Status } from '@radixdlt/babylon-gateway-api-sdk';
import { NetworkT, getBasePath } from './utils/gateway.utils';
import config from './entities.config';
import { parseEntityDetails } from './utils/entity.utils';
import { requestDomainStatus } from './requests/domain/status';
import { requestRecords, resolveRecord } from './requests/domain/records';
import { domainToNonFungId } from './utils/domain.utils';
import { requestAccountDomains } from './requests/address/domains';
import { requestAuctionDetails } from './requests/domain/auctions';

interface RnsSDKI {

    gateway?: string;
    network?: NetworkT;

}

export default class RnsSDK {

    network: NetworkT;
    state: State;
    status: Status;
    entities: any;

    constructor({ gateway, network = 'mainnet' }: RnsSDKI) {

        this.network = network;
        this.initGateway({ gateway });

    }

    initGateway({ gateway }: { gateway?: string; }): Promise<GatewayStatusResponse> {

        const { status, state } = GatewayApiClient.initialize({
            basePath: gateway ?? getBasePath(this.network),
            applicationName: 'The Radix Name Service'
        });

        this.state = state;
        this.status = status;

        return status.getCurrent();

    }

    async dAppEntities() {

        try {

            if (!this.entities) {
                this.entities = parseEntityDetails(await this.state.getEntityDetailsVaultAggregated(config[this.network].entities, { explicitMetadata: ['name'] }), this.state);
            }

            return this.entities;

        } catch (e) {
            console.log(e);
            return null;
        }

    }

    async getDomainStatus(domain: string) {

        try {
            return await requestDomainStatus(domain, { state: this.state, entities: await this.dAppEntities() });
        } catch (e) {
            console.log(e);
            return null;
        }

    }

    async getRecords(domain: string) {

        try {
            return await requestRecords(domain, { state: this.state, entities: await this.dAppEntities() });
        } catch (e) {
            console.log(e);
            return null;
        }

    }

    async resolveRecord({ domain, context, directive }: { domain: string; context?: string; directive?: string; }) {

        try {

            const platformIdentifier = `xrd.domains:${context}.${directive}`;
            const domainId = await domainToNonFungId(domain);
            const parsedContext = context ? `-${context}` : '';
            const parsedDirective = directive ? `-${directive}` : '';
            const parsedPlatformIdentifier = platformIdentifier ? `-${platformIdentifier}` : '';
            const recordId = await domainToNonFungId(`${domainId}${parsedContext}${parsedDirective}${parsedPlatformIdentifier}`);

            return await resolveRecord(recordId, { state: this.state, entities: await this.dAppEntities() });

        } catch (e) {
            console.log(e);
            return null;
        }

    }

    async getAccountDomains(accountAddress: string) {

        try {
            return await requestAccountDomains(accountAddress, { state: this.state, entities: await this.dAppEntities() });
        } catch (e) {
            console.log(e);
            return null;
        }

    }

    async getAuction(domain: string) {

        try {
            return await requestAuctionDetails(domain, { state: this.state, entities: await this.dAppEntities() });
        } catch (e) {
            console.log(e);
            return null;
        }

    }

}

(async () => {

    const rns = new RnsSDK({
        network: 'stokenet'
    });

    // const status = await rns.getDomainStatus('james2.xrd');
    // const records = await rns.getRecords('james2.xrd');

    // const resolvedRecord = await rns.resolveRecord({
    //     domain: 'test-records-present.xrd',
    //     context: 'funnels',
    //     directive: 'xrd'
    //  });

    const auctions = await rns.getAuction('wylie.xrd');

    console.log(auctions);

    //const ownerDomains = await rns.getAccountDomains('account_tdx_2_1298zn26mlsyc0gsx507cc83y7x8veyp90axzh6aefqhxxq9l7y03c7');

})();
