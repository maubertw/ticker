import React, { Component } from 'react';
import './App.css';
import subscribe from './subscribe'
import Book from './book'


class App extends Component {

  componentDidMount () {
    subscribe()
  }


  render() {
    return (
      <div className="App">
        <Book />
      </div>
    );
  }
}

export default App;
