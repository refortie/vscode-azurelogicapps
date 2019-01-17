/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from "vscode";
import { AzureTreeDataProvider, IAzureNode, UserCancelledError } from "vscode-azureextensionui";
import { LogicAppTreeItem } from "../../tree/logic-app/LogicAppTreeItem";
import { getAllIntegrationAccounts } from "../../utils/integration-account/integrationAccountUtils";
import { LogicAppIntegrationAccountsTreeItem } from "../../tree/logic-app/LogicAppIntegrationAccountsTreeItem";

export async function linkToLogicApp(tree: AzureTreeDataProvider, node?: IAzureNode): Promise<void> {
    if (!node) {
        node = await tree.showNodePicker(LogicAppTreeItem.contextValue);
    }

    if (node.parent!.treeItem instanceof LogicAppTreeItem) {
        const logicAppItem: LogicAppTreeItem = node.parent!.treeItem as LogicAppTreeItem;

        const possibleIntegrationAccounts = await getAllIntegrationAccounts(node.credentials, node.subscriptionId);
        const integrationAccountsInRegion = possibleIntegrationAccounts.filter((account) => {
            if (node instanceof LogicAppTreeItem) {
                return account.location === node.location;
            }

            return false;
        });

        const dropdownValues = integrationAccountsInRegion.map((integrationAccount) => integrationAccount.name!);

        const integrationAccountName = await vscode.window.showQuickPick(dropdownValues);

        if (!integrationAccountName) {
            throw new UserCancelledError();
        }

        logicAppItem.linkIntegrationAccount(integrationAccountName);

        node.parent!.refresh();
    }

}
