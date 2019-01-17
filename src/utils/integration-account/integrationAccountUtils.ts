/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IntegrationAccount } from "azure-arm-logic/lib/models";
import LogicAppsManagementClient from "azure-arm-logic";
import { addExtensionUserAgent } from "vscode-azureextensionui";
import { ServiceClientCredentials } from "ms-rest";


export enum IntegrationAccountSku {
    Free = "Free",
    Basic = "Basic",
    Standard = "Standard"
}

export async function createNewIntegrationAccount(integrationAccountName: string, sku: IntegrationAccountSku, location: string): Promise<IntegrationAccount> {
    const integrationAccount: IntegrationAccount = {
        location,
        name: integrationAccountName,
        properties: {},
        sku: {
            name: sku
        }
    };

    return integrationAccount;
}

export async function getAllIntegrationAccounts(credentials: ServiceClientCredentials, subscriptionId: string): Promise<IntegrationAccount[]> {
    const client = new LogicAppsManagementClient(credentials, subscriptionId);
    addExtensionUserAgent(client);

    const integrationAccounts = await client.integrationAccounts.listBySubscription();
    let nextPageLink = integrationAccounts.nextLink;

    while (nextPageLink) {
        integrationAccounts.push(...await client.integrationAccounts.listBySubscriptionNext(nextPageLink));
        nextPageLink = integrationAccounts.nextLink;
    }

    return integrationAccounts;
}
