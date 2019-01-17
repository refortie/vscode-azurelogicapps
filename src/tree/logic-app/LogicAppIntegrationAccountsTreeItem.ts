/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import LogicAppsManagementClient from "azure-arm-logic";
import { Workflow } from "azure-arm-logic/lib/models";
import { IAzureNode, IAzureParentTreeItem, IAzureTreeItem } from "vscode-azureextensionui";
import { localize } from "../../localize";
import * as nodeUtils from "../../utils/nodeUtils";
import { IntegrationAccountTreeItem } from "../integration-account/IntegrationAccountTreeItem";

export class LogicAppIntegrationAccountsTreeItem implements IAzureParentTreeItem {
    public static contextValue = "azLogicAppsIntegrationAccounts";
    public readonly childTypeLabel = localize("azLogicApps.integrationAccount", "Integration Account");
    public readonly contextValue = LogicAppIntegrationAccountsTreeItem.contextValue;
    public readonly label = localize("azLogicApps.integrationAccount", "Integration Account");

    public constructor(private readonly client: LogicAppsManagementClient, private readonly workflow: Workflow) {
    }

    public hasMoreChildren() {
        return false;
    }

    public get iconPath(): nodeUtils.IThemedIconPath {
        return nodeUtils.getThemedIconPath("BulletList");
    }

    public get id(): string | undefined {
        if (!this.workflow.integrationAccount) {
            return undefined;
        } else {
            return this.workflow.integrationAccount.id;
        }
    }

    public get name(): string | undefined {
        if (!this.workflow.integrationAccount) {
            return undefined;
        } else {
            return this.workflow.integrationAccount.name;
        }
    }

    public get resourceGroupName(): string {
        return this.workflow.id!.split("/").slice(-5, -4)[0];
    }

    public get workflowName(): string {
        return this.workflow.name!;
    }

    public async loadMoreChildren(_: IAzureNode, clearCache: boolean): Promise<IAzureTreeItem[]> {
        if (!this.name) {
            return [];
        } else {
            const integrationAccount = await this.client.integrationAccounts.get(this.resourceGroupName, this.name);

            return [new IntegrationAccountTreeItem(this.client, integrationAccount)];
        }
    }
}
