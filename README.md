# Salesforce DX Project: Next Steps

Now that you’ve created a Salesforce DX project, what’s next? Here are some documentation resources to get you started.

## Set up Visual Studio Code for Salesforce Development

To develop with Salesforce DX, you need to set up Visual Studio Code (VS Code) with the necessary extensions and connect it to your Salesforce orgs.
1. **[Install Visual Studio Code](https://developer.salesforce.com/docs/platform/sfvscode-extensions/guide/install.html#install-visual-studio-code)**: If you haven't already, download and install VS Code.
2. **[Install Salesforce Extensions](https://developer.salesforce.com/docs/platform/sfvscode-extensions/guide/install.html#install-salesforce-extension-pack)**: Open VS Code, go to the Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`), and search for "Salesforce Extension Pack". Install it to get all the necessary tools for Salesforce development.
3. **[Install Salesforce CLI](https://developer.salesforce.com/docs/platform/sfvscode-extensions/guide/install.html#install-salesforce-cli)**: Download and install the Salesforce CLI, which is essential for managing your Salesforce DX projects and orgs.
4. **[Install Java](https://developer.salesforce.com/docs/platform/sfvscode-extensions/guide/java-setup.html#download-and-install-jdk)**: Some Salesforce CLI commands require Java. Make sure you have the Java Development Kit (JDK) installed on your machine.

## Connect to your dev hub org

*Connecting org*
1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS), type "SFDX: Authorize a Dev Hub", and press Enter.
3. Enter Alias: Give the org a unique nickname (alias) to easily identify it (You will need this later)
4. Log In: Your default browser will open. Enter your Salesforce credentials (Provided during presentation).
   username = wouter+asci.0d2f75af8be2@agentforce.com
5. Allow Access

---

## Create a Scratch Org

A scratch org is a dedicated, configurable, and short-term Salesforce environment.

1. Press `Ctrl+Shift+P` / `Cmd+Shift+P`, type **"SFDX: Create a Default Scratch Org..."**, and press Enter.
2. **Select Definition File:** Choose the default `config/project-scratch-def.json`.
3. **Enter Alias:** Give your scratch org a nickname (e.g., `MyWorkOrg`).
4. **Set Duration:** Enter the number of days you want the org to last (e.g., `7`).
5. Wait for the notification "SFDX: Create Default Scratch Org successfully ran."

---

## Push Metadata to the Org

Once the scratch org is created, you need to deploy your local code and configuration into it.

1. Press `Ctrl+Shift+P` / `Cmd+Shift+P`.
2. Type and select **"SFDX: Push Source to Default Scratch Org"**.
3. Check the **Output** panel at the bottom of VS Code to ensure the status says `Successfully ran`.

---

## View Your Changes

To see the metadata you just deployed in the Salesforce UI:

1. Press `Ctrl+Shift+P` / `Cmd+Shift+P`.
2. Type and select **"SFDX: Open Default Org"**.
3. Your browser will automatically open and log you into the scratch org.

---

## Create Mock Data

To create mock data you can run an apex script in the scratch org:
1. Open the file `scripts/apex/seed.apex` in VS Code.
2. Press `Ctrl+Shift+P` / `Cmd+Shift+P`.
3. Type and select **"SFDX: Execute Anonymous Apex with Editor Contents"**
4. Check the **Output** panel at the bottom of VS Code to ensure the status says `Successfully ran`.
5. Open the scratch org and navigate to the Opportunities tab to see the new records.

---

## Handy CLI Commands

If you prefer using the terminal, use these commands:

| Task             | Command                                                                  |
|:-----------------|:-------------------------------------------------------------------------|
| **Create Org**   | `sf org create scratch -f config/project-scratch-def.json -a MyOrgAlias` |
| **Deploy/Push**  | `sf project deploy start`                                                |
| **Open Org**     | `sf org open`                                                            |
| **Check Status** | `sf project deploy report`                                               |

> **Note:** If you make changes directly in the Scratch Org UI (like adding a field), remember to use **"SFDX: Pull Source from Default Scratch Org"** to sync those changes back to your local VS Code project.

## Configure Your Salesforce DX Project

The `sfdx-project.json` file contains useful configuration information for your project. See [Salesforce DX Project Configuration](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ws_config.htm) in the _Salesforce DX Developer Guide_ for details about this file.

## Read All About It

- [Salesforce Extensions Documentation](https://developer.salesforce.com/tools/vscode/)
- [Salesforce CLI Setup Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm)
- [Salesforce DX Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_intro.htm)
- [Salesforce CLI Command Reference](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference.htm)
