import RnsSDK from '../..';
import Decimal from 'decimal.js';
import { matchObjectTypes } from '../utils';
import { convertToDecimal } from '../../utils/decimal.utils';

const attributesSchema = {
    status: 'string',
    verbose: 'string',
    price: 'object'
};


describe('RNS - Fetch Domain Attributes', () => {

    const rns = new RnsSDK({ network: 'stokenet' });

    it(`should return a 'registered' or 'settlement' status and decimal / numerical denoted price.`, async () => {

        const attributes = await rns.getDomainAttributes('radixnameservice.xrd');

        expect(matchObjectTypes(attributes, attributesSchema)).toBe(true);
        expect(attributes.status).not.toBe('available');

        expect(typeof attributes.price === 'object' && typeof attributes.price.usd === 'number' && (typeof attributes.price.xrd === 'number' || typeof attributes.price.xrd === 'object')).toBe(true);
        
        const xrdPriceDecimal = convertToDecimal(attributes.price.xrd);
        expect(xrdPriceDecimal).toBeInstanceOf(Decimal);
        expect(xrdPriceDecimal.toNumber()).toBeGreaterThan(0);
        expect(attributes.price.usd).toBe(4);

    });

});