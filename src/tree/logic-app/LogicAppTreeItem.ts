/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import LogicAppsManagementClient from "azure-arm-logic";
import { Sku, Workflow } from "azure-arm-logic/lib/models";
import { IAzureParentTreeItem, IAzureTreeItem } from "vscode-azureextensionui";
import { localize } from "../../localize";
import { Callbacks, getCallbacks } from "../../utils/logic-app/callbackUtils";
import { ConnectionReferences, getConnectionReferencesForLogicApp } from "../../utils/logic-app/connectionReferenceUtils";
import { getIconPath } from "../../utils/nodeUtils";
import { LogicAppIntegrationAccountsTreeItem } from "./LogicAppIntegrationAccountsTreeItem";
import { LogicAppRunsTreeItem } from "./LogicAppRunsTreeItem";
import { LogicAppTriggersTreeItem } from "./LogicAppTriggersTreeItem";
import { LogicAppVersionsTreeItem } from "./LogicAppVersionsTreeItem";

export class LogicAppTreeItem implements IAzureParentTreeItem {
    public static contextValue = "azLogicAppsWorkflow";
    public readonly childTypeLabel: string = localize("azLogicApps.child", "Child");
    public contextValue = LogicAppTreeItem.contextValue;
    public integrationAccountItem: LogicAppIntegrationAccountsTreeItem;
    public logicAppRunsItem: LogicAppRunsTreeItem;
    public logicAppTriggersItem: LogicAppTriggersTreeItem;
    public logicAppVersionsItem: LogicAppVersionsTreeItem;

    public constructor(private readonly client: LogicAppsManagementClient, private workflow: Workflow) {
        this.integrationAccountItem = new LogicAppIntegrationAccountsTreeItem(client, workflow);
        this.logicAppRunsItem = new LogicAppRunsTreeItem(client, workflow);
        this.logicAppTriggersItem = new LogicAppTriggersTreeItem(client, workflow);
        this.logicAppVersionsItem = new LogicAppVersionsTreeItem(client, workflow);
    }

    public get iconPath(): string {
        return getIconPath(LogicAppTreeItem.contextValue);
    }

    public get id(): string {
        return this.workflow.id!;
    }

    public get integrationAccountId(): string | undefined {
        const { integrationAccount } = this.workflow;
        return integrationAccount !== undefined ? integrationAccount.id : undefined;
    }

    public get label(): string {
        return this.workflow.name!;
    }

    public get location(): string {
        return this.workflow.location!;
    }

    public get resourceGroupName(): string {
        return this.workflow.id!.split("/").slice(-5, -4)[0];
    }

    public get sku(): Sku | undefined {
        return this.workflow.sku;
    }

    public get workflowName(): string {
        return this.workflow.name!;
    }

    public hasMoreChildren(): boolean {
        return false;
    }

    public async deleteTreeItem(): Promise<void> {
        await this.client.workflows.deleteMethod(this.resourceGroupName, this.workflowName);
    }

    public async disable(): Promise<void> {
        await this.client.workflows.disable(this.resourceGroupName, this.workflowName);
    }

    public async enable(): Promise<void> {
        await this.client.workflows.enable(this.resourceGroupName, this.workflowName);
    }

    public async getCallbacks(): Promise<Callbacks> {
        return getCallbacks(this.client, this.workflow.definition, this.resourceGroupName, this.workflowName);
    }

    public async getData(refresh = false): Promise<string> {
        if (refresh) {
            this.workflow = await this.client.workflows.get(this.resourceGroupName, this.workflowName);
        }

        return JSON.stringify(this.workflow.definition, null, 4);
    }

    public async getReferences(): Promise<ConnectionReferences> {
        return getConnectionReferencesForLogicApp(this.client.credentials, this.client.subscriptionId, this.resourceGroupName, this.workflowName, this.client.apiVersion);
    }

    public async loadMoreChildren(): Promise<IAzureTreeItem[]> {
        const children: IAzureTreeItem[] = [
            this.integrationAccountItem,
            this.logicAppRunsItem,
            this.logicAppTriggersItem,
            this.logicAppVersionsItem
        ];
        return children;
    }

    public pickTreeItem(expectedContextValue: string): IAzureTreeItem | undefined {
        switch (expectedContextValue) {
            case LogicAppIntegrationAccountsTreeItem.contextValue:
                return this.integrationAccountItem;

            case LogicAppRunsTreeItem.contextValue:
                return this.logicAppRunsItem;

            case LogicAppTriggersTreeItem.contextValue:
                return this.logicAppTriggersItem;

            case LogicAppVersionsTreeItem.contextValue:
                return this.logicAppVersionsItem;

            default:
                return undefined;
        }
    }

    public async update(definition: string): Promise<string> {
        const workflow: Workflow = {
            definition: JSON.parse(definition),
            integrationAccount: this.workflow.integrationAccount || undefined,
            location: this.workflow.location,
            tags: this.workflow.tags || undefined
        };

        const updatedWorkflow = await this.client.workflows.createOrUpdate(this.resourceGroupName, this.workflowName, workflow);

        return JSON.stringify(updatedWorkflow.definition, null, 4);
    }

    public async linkIntegrationAccount(integrationAccountName: string): Promise<void> {
        this.workflow.integrationAccount = {
            name: integrationAccountName
        };

        await this.client.workflows.createOrUpdate(this.resourceGroupName, this.workflowName, this.workflow);
    }
}
