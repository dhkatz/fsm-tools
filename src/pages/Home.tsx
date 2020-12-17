import React from 'react';
import {Container} from "react-bootstrap";
import {Link} from "react-router-dom";

export const Home = () => {
  return <Container>
    <h1>FSM Tools</h1>
    <div>
      <h2>Simulator</h2>
      <p>Simulate a deterministic finite state machine by visiting the <Link to={"/simulator"}>simulator</Link>.</p>
      <br/>
      <h2>Minimizer</h2>
      <p>Minimize a deterministic finite state machine by visiting the <Link to={"/minimizer"}>minimizer</Link>.</p>
    </div>
  </Container>
};
