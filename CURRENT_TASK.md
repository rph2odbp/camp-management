# Current Task Reminder

Our main objective is to migrate the Firebase project `kateri-fbc` into your Google Cloud Organization.

## Blocker
We are currently blocked by the **"Domain Restricted Sharing"** organization policy (`constraints/iam.allowedPolicyMemberDomains`). This policy prevents us from granting the necessary `Project Creator` role to your personal `@gmail.com` account, which is required to perform the migration.

## Current Status
1.  We attempted to use the Google Cloud Console, but failed because even a Super Admin can be blocked by API/credential restrictions.
2.  We decided to use the `gcloud` command-line tool to bypass this.
3.  The `gcloud` command was not found in the environment.
4.  I have just added the `google-cloud-sdk` package to your `.idx/dev.nix` file.

## Action Required By You
You need to **reload the environment** by clicking the "Reload" button in the notification. This will install `gcloud` and make it available in the terminal.

## Plan After Reload
Once you reload and tell me to continue, I will guide you through the following steps using the terminal:
1.  Authenticate `gcloud` using your Super Admin account.
2.  Get your Organization ID.
3.  Create a `policy.yaml` file to disable the domain restriction.
4.  Apply this policy to your organization.
5.  Proceed with the project migration.
6.  Re-enable the security policy.
