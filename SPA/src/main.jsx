import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { MsalProvider } from '@azure/msal-react'
import { PublicClientApplication } from '@azure/msal-browser'
import { msalConfig } from './config/authConfig.js'

const msalInstance = new PublicClientApplication(msalConfig);
await msalInstance.initialize();

// const redirectResponse = await msalInstance.handleRedirectPromise();
// if (redirectResponse?.account) {
//   msalInstance.setActiveAccount(redirectResponse.account);
// } else if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts()[0]) {
//   msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
// }

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  </StrictMode>,
)
