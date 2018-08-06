import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

//Components
import Rrofit from '../profit';
import Record from '../record';

export default class Roters extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      
    }
  }

  render() {
    return(
        <Switch>
            <Route exact path="/profit" component={Rrofit}/>
            <Route path="/profit/:current" component={Rrofit}/>
            <Route exact path="/record" component={Record}/>
            <Route path="/record/:type/:current" component={Record}/>
            <Route path="/record/:type" component={Record}/>
            <Route exact path="/" render={() => 
              <Redirect to="/profit" component={Rrofit} />
            }/>
        </Switch>
    );
  }
}
