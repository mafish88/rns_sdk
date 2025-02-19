import issueBadgeManifest from "../../manifests/badges/user-badge-manifest";

import errors from "../../mappings/errors";
import { errorStack, successResponse } from "../../utils/response.utils";
import { sendTransaction } from "../../utils/transaction.utils";

import { UserBadgeDispatcherPropsI } from "../../common/dispatcher.types";
import { ErrorStackResponseI, CommitmentStackResponseI } from "../../common/response.types";


export async function dispatchUserBadgeIssuance({
    sdkInstance,
    rdt,
    userDetails,
    callbacks
}: UserBadgeDispatcherPropsI): Promise<CommitmentStackResponseI | ErrorStackResponseI> {

    try {

        const manifest = issueBadgeManifest({
            sdkInstance,
            userDetails
        });

        const dispatch = await sendTransaction({
            rdt,
            message: `Issue RNS User Badge`,
            manifest,
            transaction: sdkInstance.transaction,
            callbacks
        });

        if (!dispatch)
            return errorStack(errors.badge.issuance({ accountAddress: userDetails.accountAddress }));


        return successResponse({
            code: 'USER_BADGE_ISSUED',
            details: `An RNS badge was was succesfully issued to account: ${userDetails.accountAddress}.`
        });

    } catch (error) {

        return errorStack(errors.badge.issuance({ accountAddress: userDetails.accountAddress, verbose: error }));

    }

}