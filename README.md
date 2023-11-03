# Junit Summary Action

This GitHub Action processes JUnit test reports and adds a detailed summary to the GitHub Actions job summary. If provided with `xcresult` or screenshots paths, it can also upload screenshots from the test run and include them in the summary.

## Inputs

### `junit-path`
**Required** The relative path to the JUnit report file.  
**Default:** `report.junit`

### `xcresult-path`
The path to your `xcresult` file. Providing this will automatically upload and add screenshots from the test run to the summary.

### `screenshots-path`
The path to the folder containing screenshots. The names of the screenshots must contain the name of the test for them to be linked in the report.

## Environment Variables

### `FIREBASE_SERVICE_ACCOUNT`
**Required for uploading screenshots** A Firebase service account key in JSON format. This is used to upload screenshots to Firebase for storage.

### `FIREBASE_STORAGE_BUCKET`
The domain of your Firebase storage bucket, such as `your-app.appspot.com`.

## Usage

Below is an example of how to set up this action in your workflow file:

```yaml
on: [push]
jobs:
  create_summary:
    runs-on: ubuntu-latest
    name: A job to say hello
    steps:
    - name: Checkout
      uses: actions/checkout@v2
    
    - name: Add JUnit Summary
      uses: your-github-username/junit-summary-action@v1
      with:
        junit-path: src/debug/example.xml
      env:
        FIREBASE_SERVICE_ACCOUNT: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
        FIREBASE_STORAGE_BUCKET: your-app.appspot.com
```

## Setting Up Firebase Storage Bucket
To host screenshots in your summary, you'll need to create a Firebase Storage bucket:

1. Go to the Firebase Console.
2. Select your project. If you don’t have one, create it by clicking on 'Add project', and follow the on-screen instructions.
3. Once your project is selected, click on 'Storage' in the left-hand menu to create your storage bucket.
4. Click 'Get started' which will lead you through the setup process, including setting security rules for file access. For the purpose of CI artifacts, you can start with Firebase's default security rules.
5. During the setup, you will be prompted to choose a location for your storage bucket. Choose the location closest to your user base for the best performance.
6. After setup, you will see your storage bucket's domain, which looks like your-app-id.appspot.com. Make note of this as you will need it for setting the FIREBASE_STORAGE_BUCKET environment variable.

## Setting Up Firebase Service Account
For your GitHub Action to interact with Firebase, including uploading screenshots, you must create a Firebase service account and obtain a JSON key:

1. From the Firebase Console's project overview page, navigate to 'Project settings'.
2. Click on the 'Service accounts' tab.
3. Here you will see an option to generate a new private key. Click on 'Generate new private key' and confirm the action.
4. After the key is generated, you will download a JSON file. This is your service account key. Keep it confidential and secure.

## Configuring GitHub Secrets
After setting up your Firebase Storage bucket and service account, configure your GitHub repository with the necessary secrets.

1. Go to your GitHub repository's Settings.
2. Click on 'Secrets' and then 'New repository secret'.
3. Add two secrets:
Name one secret FIREBASE_SERVICE_ACCOUNT and paste the contents of your downloaded JSON file into the value field.
Name the other secret FIREBASE_STORAGE_BUCKET and enter your Firebase storage bucket domain as the value.

Now your GitHub Action is configured to upload screenshots to Firebase and display them in the summary report.

## Contributing
If you have suggestions for how this action could be improved, or want to report a bug, please open an issue or a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.