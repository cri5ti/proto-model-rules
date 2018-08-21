import * as React from 'react';
import { render } from 'react-dom';
import Form from './view/Form';
import './style.css';

interface AppProps { }
interface AppState { }

class App 
  extends React.Component<AppProps, AppState> 
{
  render() {
    return (
      <div>
        <Form/>
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));



