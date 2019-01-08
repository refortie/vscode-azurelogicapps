/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from "vscode";
import { AzureTreeDataProvider, IAzureNode } from "vscode-azureextensionui";
import { localize } from "../../localize";
import { LogicAppTreeItem } from "../../tree/logic-app/LogicAppTreeItem";
import { getAuthorization } from "../../utils/authorizationUtils";
import { getWebviewContentForDesigner } from "../../utils/logic-app/designerUtils";

export async function linkToLogicApp(tree: AzureTreeDataProvider, node?: IAzureNode): Promise<void> {
    if (!node) {
        node = await tree.showNodePicker(LogicAppTreeItem.contextValue);
    }

    const possibleIntegrationAccounts = 
    const integrationAccountName = await vscode.window.showInputBox();
    if (integrationAccountName) {
        wizardContext.integrationAccountName = integrationAccountName.trim();
        return wizardContext;
    }
}
