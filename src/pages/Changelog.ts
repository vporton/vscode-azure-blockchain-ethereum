// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import * as fs from 'fs-extra';
import * as semver from 'semver';
import { commands, ExtensionContext } from 'vscode';
import { Constants } from '../Constants';
import { Telemetry } from '../TelemetryClient';
import { BasicWebView, IWebViewConfig } from './BasicWebView';

export class ChangelogPage extends BasicWebView {
  protected readonly config: IWebViewConfig;

  constructor(context: ExtensionContext) {
    super(context);
    this.config = Object.assign({}, Constants.webViewPages.changelog);
  }

  public async checkAndShow(): Promise<void> {
    const storedVersion = this.context.globalState.get<string>(
      Constants.globalStateKeys.azureBlockchainExtensionVersion);
    if (storedVersion && semver.gte(storedVersion, Constants.extensionVersion)) {
      return;
    }

    this.context.globalState.update(
      Constants.globalStateKeys.azureBlockchainExtensionVersion,
      Constants.extensionVersion);

    Telemetry.sendEvent(
      Constants.telemetryEvents.webPages.showWebPage,
      {
        trigger: 'auto',
        viewType: this.config.viewType,
      },
    );

    return this.createAndShow();
  }

  protected async setShowOnStartupFlagAtFirstTime(): Promise<boolean> {
    return true;
  }

  protected async getHtmlForWebview(): Promise<string> {
    const resourcePath = this.rootPath.with({ scheme: 'vscode-resource' }).toString();
    const html = await fs.readFile(this.config.path, 'utf8');
    const content = await fs.readFile(Constants.webViewPages.changelog.changelogPath, 'utf8');
    const htmlContent = await commands.executeCommand('markdown.api.render', content) as string;

    return html.replace(/{{root}}/g, resourcePath).replace(/{{content}}/g, htmlContent);
  }
}
