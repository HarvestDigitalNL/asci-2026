# Salesforce DX Project: Next Steps

Now that you’ve created a Salesforce DX project, what’s next? Here are some documentation resources to get you started.
## Create a free Salesforce Developer Edition org

Each student needs their own Salesforce environment. Sign up for a free Developer Edition org:

1. Go to [https://developer.salesforce.com/signup](https://developer.salesforce.com/signup)
2. Fill in the form with your name, email, and a username (this must be in email format, e.g. `yourname@dev.example.com` — it does not need to be a real email address).
3. Check your inbox and click the verification link.
4. Set your password and log in to confirm everything works.

> Keep your username and password safe — you'll need them later to connect VS Code to your org.

---
## Set up Visual Studio Code for Salesforce Development

To develop with Salesforce DX, you need to set up Visual Studio Code (VS Code) with the necessary extensions and connect it to your Salesforce orgs.
1. **[Install Visual Studio Code](https://developer.salesforce.com/docs/platform/sfvscode-extensions/guide/install.html#install-visual-studio-code)**: If you haven't already, download and install VS Code.
2. **[Install Salesforce Extensions](https://developer.salesforce.com/docs/platform/sfvscode-extensions/guide/install.html#install-salesforce-extension-pack)**: Open VS Code, go to the Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`), and search for "Salesforce Extension Pack". Install it to get all the necessary tools for Salesforce development.
3. **[Install Salesforce CLI](https://developer.salesforce.com/docs/platform/sfvscode-extensions/guide/install.html#install-salesforce-cli)**: Download and install the Salesforce CLI, which is essential for managing your Salesforce DX projects and orgs.
4. **[Install Java](https://developer.salesforce.com/docs/platform/sfvscode-extensions/guide/java-setup.html#download-and-install-jdk)**: Some Salesforce CLI commands require Java. Make sure you have the Java Development Kit (JDK) installed on your machine.

## Clone the project and connect your org

1. Clone the repository: open a terminal and run:
   ```
   git clone https://github.com/HarvestDigitalNL/asci-2026.git
   ```
2. Open the project folder in VS Code: **File → Open Folder...** and select the `asci-2026` folder you just cloned. VS Code should recognize the `sfdx-project.json` and activate the Salesforce extensions.
3. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS), type **"SFDX: Authorize an Org"**, and press Enter.
4. **Select login URL:** Choose **Production** (`https://login.salesforce.com`).
5. **Enter Alias:** Give the org a unique nickname (e.g., `MyDevOrg`).
6. Your browser will open. Log in with the Developer Edition credentials you created earlier.
7. Click **Allow** to grant VS Code access.

---

## Deploy Metadata to the Org

Now deploy your local code and configuration into your Developer Edition org.

1. Press `Ctrl+Shift+P` / `Cmd+Shift+P`.
2. Type and select **"SFDX: Deploy This Source to Org"** (make sure you have the `force-app` folder or a file inside it selected).
3. Check the **Output** panel at the bottom of VS Code to ensure the status says `Successfully ran`.

---

## Activate the Opportunity Record Page

The deploy includes a custom Opportunity record page with the Flight Search component, but it needs to be activated:

1. Press `Ctrl+Shift+P` / `Cmd+Shift+P`, type **"SFDX: Open Default Org"** and press Enter.
2. Navigate to any Opportunity record (or create one first via the Opportunities tab).
3. Click the **gear icon ⚙️** in the top-right corner and select **Edit Page**.
4. In the Lightning App Builder, click **Activation** (top-right).
5. Go to the **Org Default** tab and click **Assign as Org Default**.
6. Click **Save**, then click **← Back** (top-left) to return to the record.

You should now see the Flight Search component on every Opportunity record page.

---

## Create Mock Data

To create mock data you can run an Apex script in your org:
1. Open the file `scripts/apex/seed.apex` in VS Code.
2. Press `Ctrl+Shift+P` / `Cmd+Shift+P`.
3. Type and select **"SFDX: Execute Anonymous Apex with Editor Contents"**
4. Check the **Output** panel at the bottom of VS Code to ensure the status says `Successfully ran`.
5. Open your org and navigate to the Opportunities tab to see the new records.

---

## Handy CLI Commands

If you prefer using the terminal, use these commands:

| Task             | Command                            |
|:-----------------|:-----------------------------------|
| **Authorize Org** | `sf org login web -a MyDevOrg`    |
| **Deploy**       | `sf project deploy start`          |
| **Open Org**     | `sf org open`                      |
| **Check Status** | `sf project deploy report`         |

## Configure Your Salesforce DX Project

The `sfdx-project.json` file contains useful configuration information for your project. See [Salesforce DX Project Configuration](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ws_config.htm) in the _Salesforce DX Developer Guide_ for details about this file.

## Read All About It

- [Salesforce Extensions Documentation](https://developer.salesforce.com/tools/vscode/)
- [Salesforce CLI Setup Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm)
- [Salesforce DX Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_intro.htm)
- [Salesforce CLI Command Reference](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference.htm)
