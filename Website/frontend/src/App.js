import './App.css';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Payportal from './Payportal';
import Upload from './Upload';
import Check from './Check';
import Format from './Format';
import Table from './Table';

function App() {
  return (
    <>
    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
      <Container>
        <Navbar.Brand href="/">CCFD</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav" className="justify-content-end">
          <Nav >
            <Nav.Link href="/check">Check Transaction</Nav.Link>
            <Nav.Link href="/upload">Upload File</Nav.Link>
            <Nav.Link href="/format">Format File</Nav.Link>
            <Nav.Link href="/table">View Table</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    <div class="containerPay">
      <BrowserRouter>
      <Routes>
        <Route path='/' Component={Payportal}></Route>
        <Route path='/upload' Component={Upload}></Route>
        <Route path='/check' Component={Check}></Route>
        <Route path='/format' Component={Format}></Route>
        <Route path='/table' Component={Table}></Route>
      </Routes>
      </BrowserRouter>
    </div>
    </>
  );
}

export default App;
