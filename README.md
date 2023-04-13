# Estuary

- This is a simple React App using which you can upload any file to IPFS and it will generate an IPFS hash, link and QR code which can be then shared with people or used however you want.

- Users can sign up to create an account on the app, all of which is handled via Firebase. You can limit sign ups to certain whitelisted domains (this can be done on Firebase as well).

- As [Infura](https://infura.io) no longer provides a free IPFS gateway, you will need to create an account and use your own API keys in order to run your own instance. You will also need to provide a Firebase API key. 

## 🔧 Setting up Local Development

Required: 
- [Node v17](https://nodejs.org/download/release/latest-v17.x/)  
- [Yarn](https://classic.yarnpkg.com/en/docs/install/) 
- [Git](https://git-scm.com/downloads)

Clone the repo and install the necessary dependencies with `npm install`

```bash
git clone https://github.com/et0and/estuary
cd estuary
npm install
```

Rename the .env.example to .env and set the following secret variables accordingly:
1. REACT_APP_INFURA_PROJECT_ID
2. REACT_APP_INFURA_PROJECT_SECRET
3. FIREBASE_API
4. FIREBASE_AUTH_DOMAIN
5. FIREBASE_PROJECT_ID
6. FIREBASE_STORAGE_BUCKET
7. FIREBASE_MSG_SENDER_ID
8. FIREBASE_APP_ID

You can get these by signing up for the infura IPFS service and Firebase respectively. Infura requires a credit card but they won't charge you until you cross the free 5GB limit.

To run the application:
```bash
npm start
```

The site is now running at `http://localhost:3000`!

## Credits

Many thanks to [Lokesh Kumar (@codeTIT4N)](https://github.com/codeTIT4N) for the original [IPFS-upload](https://github.com/codeTIT4N/IPFS-upload) repo, for which this is largely based off. 