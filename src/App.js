import './App.css';
import { withAuthenticator, Button, Heading } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

function App({ signOut, user }) {
  return (
    <div className="App">
      <header className="App-header">

        {/* Тук ще добавим основната логика на приложението */}
        {/*<h2>Добре дошли в приложението за уговаряне на срещи!</h2>*/}

        <Button onClick={signOut} style={{marginTop: '20px'}}>Изход</Button>*
      </header>
    </div>
  );
}

export default withAuthenticator(App, {
  loginMechanisms: ['email'],
  signUpAttributes: ['name'],
});