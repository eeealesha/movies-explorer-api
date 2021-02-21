import './App.css';
import Main from "../Main/Main";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import {Switch, Route} from "react-router-dom";

function App() {

  return (
    <div className="App">
      <Header></Header>
      <Switch>
      <Route path="/">
      <Main></Main>
      </Route>
      </Switch>
      <Footer></Footer>
    </div>
  );
}

export default App;
