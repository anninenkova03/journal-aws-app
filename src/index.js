import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import App from './App';

Amplify.configure({
  Auth: { 
    Cognito: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_C2OZHp0kB',
    userPoolClientId: 'g0i8mghqbvlgmi13t5p5d2s1b',
    authenticationFlowType: 'USER_PASSWORD_AUTH', 
    aws_cognito_identity_pool_id: undefined,
  }
  },
  API: {
    endpoints: [
      {
        name: "JournalApi", 
        endpoint: "https://abpg4l3obe.execute-api.us-east-1.amazonaws.com/v1",
        region: 'us-east-1'
      }
    ]
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);