# ABC Scores

A Vue 3 and Vite storefront for discovering and collecting sheet music.

## Firebase authentication

The app uses Firebase Authentication with email/password and Google sign-in, and stores each profile in Firestore at `users/{uid}`. New accounts are assigned the `user` role. Public registration cannot select or change a role.

1. In the Firebase Console, create a Web app and copy its configuration into a local `.env` file using [.env.example](./.env.example) as a template. The local `.env` is ignored by git.
2. In **Authentication → Sign-in method**, enable **Email/Password** and **Google**. In the Google provider's **Web SDK configuration**, set the OAuth client ID (and client secret if requested) from Google Cloud Console. Firebase Auth reads this configuration for its popup flow; the client ID should not be passed as a custom OAuth parameter from the app.
3. Add your development and production hostnames under **Authentication → Settings → Authorized domains**.
4. Create a **Cloud Firestore** database.
5. Deploy the included Firestore security rules with the Firebase CLI: `firebase deploy --only firestore:rules --project YOUR_FIREBASE_PROJECT_ID`.
6. Start the app with `npm run dev`.

The OAuth client ID is not a Firebase web-app configuration field and is not read directly from `.env` by this app. Configure it on the Firebase Google sign-in provider; the Firebase Authentication SDK uses that provider configuration when opening the Google sign-in popup.

The Firestore rules restrict profile reads to the account owner, require new profiles to use the `user` role, and prevent clients from changing their role or email. Assign elevated roles only from a trusted administrative environment (such as the Firebase Console or a secured server using the Admin SDK), never from the public client.

If Firebase settings are missing, the app displays setup guidance on the sign-in page. The Firebase web configuration is intended for client apps; Firestore security rules are what protect the stored data.

## Admin dashboard and Google Drive

1. Set `VITE_ABC_SCORES_FOLDER_ID` to the destination Drive folder ID. Keep `VITE_API_KEY` for Firebase only; do not define it twice.
2. Enable the **Google Drive API** in the Google Cloud project.
3. Configure Google OAuth for Firebase and grant the `drive.file` scope. The administrator connects the Drive account from the dashboard; this requests OAuth permission and obtains a short-lived Drive token. Authenticated Drive requests use this OAuth access token and do not need a Drive API key.
4. Deploy Firestore rules using the command above. Admin pages are linked at `/admin` only for profiles whose role is `admin`.
5. Bootstrap the first administrator manually in Firebase Console → Firestore → `users` → the administrator's Firebase Auth UID document. Change only its `role` field to `admin`, then sign out and back in so the app reloads the role.

The dashboard writes score metadata and Drive PDF links to the Firestore `scores` collection. Public PDF access is optional and can be selected during upload; collection preview links open the PDF in Google Drive and require the file to be shared with the viewer.

Visitors can request a license from a collection score card. Guests provide their name and email; signed-in users use their account details. Requests are stored in `licenseRequests`, where only administrators can read or review them. The **License requests** dashboard tab lets admins approve or decline pending requests. Before approval, admins can edit the score title and licensee name; the approved values are saved for future downloads. Approval fills `public/license_letter.docx` (`{{Title_Scores}}`, `{{Licensed_To}}`, and `{{Date_Issued}}`, including time) and downloads the resulting DOCX as `License Letter - {{Title_Scores}} ({{Licensed_To}}).docx`. Deploy the Firestore rules after adding this workflow so public submissions and administrator-only review are enforced.

## Project setup

```sh
npm install
npm run dev
```

## Build and lint

```sh
npm run build
npm run lint
```
