import registerDomainManifest from "../../manifests/domains/domain-registration-manifest";

import { domainErrors, registrationErrors } from "../../common/errors";
import { sendTransaction } from "../../utils/transaction.utils";
import { convertToDecimal, multiplyDecimal } from "../../utils/decimal.utils";
import { getBasePrice } from "../../utils/pricing.utils";
import { errorStack, successResponse } from "../../utils/response.utils";

import { RegistrationDispatcherPropsI } from "../../common/dispatcher.types";
import { ErrorStackResponseI, CommitmentStackResponseI } from "../../common/response.types";


export async function dispatchDomainRegistration({
    sdkInstance,
    domain,
    rdt,
    durationYears,
    userDetails,
    callbacks
}: RegistrationDispatcherPropsI): Promise<CommitmentStackResponseI | ErrorStackResponseI> {

    try {

        const attributeRequest = await sdkInstance.getDomainAttributes({ domain });

        if (attributeRequest instanceof Error)
            throw attributeRequest;

        if ('errors' in attributeRequest)
            return attributeRequest;

        const attributes = attributeRequest.data;

        if (attributes.status !== 'available')
            return errorStack(domainErrors.unavailable({ domain }));

        const manifest = await registerDomainManifest({
            sdkInstance,
            domain,
            userDetails,
            durationYears,
            price: multiplyDecimal(convertToDecimal(getBasePrice(domain, sdkInstance.dependencies.rates.usdXrd).xrd), durationYears)
        });

        const dispatch = await sendTransaction({
            rdt,
            message: `Register ${domain}`,
            manifest,
            transaction: sdkInstance.transaction,
            callbacks
        });

        if (!dispatch)
            return errorStack(registrationErrors.generic({ domain }));

        return successResponse({
            code: 'REGISTRATION_SUCCESSFUL',
            details: `${domain} was succesfully registered.`
        });

    } catch (error) {

        return errorStack(registrationErrors.generic({ domain, verbose: error }));

    }

}