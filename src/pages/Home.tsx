import React from 'react';
import {Container} from "react-bootstrap";
import {Link} from "react-router-dom";

export const Home = () => {
  return <Container>
    <h1>FSM Tools</h1>
    <div>
      <div>
        <h2>Simulator</h2>
        <p>Simulate a deterministic finite state machine by visiting the <Link to={"/simulator"}>simulator</Link>.</p>
        <h2>Minimizer</h2>
        <p>Minimize a deterministic finite state machine by visiting the <Link to={"/minimizer"}>minimizer</Link>.</p>
      </div>
      <h2>Syntax</h2>
      <p>There is a specific syntax for defining machine descriptions.</p>
      <h4>Sections</h4>
      <p>Machine descriptions can contain five sections: states, initial, accept, alphabet, and transitions.</p>
      <div>
        <h5>States</h5>
        <p>The states section is defined as the following:</p>
        <code>
          :states:<br/>
          (alphanumeric string)<br/>
          (alphanumeric string)<br/>
          ...
        </code>
        <br/>
        <br/>
        <p>As an example:</p>
        <code>
          :states:<br/>
          a<br/>
          b<br/>
        </code>
      </div>
      <br/>
      <div>
        <h5>Initial</h5>
        <p>The initial section is defined as an alphanumeric string which is defined in the states section.</p>
        <p>In the case of the example above:</p>
        <code>
          :initial:<br/>
          a
        </code>
      </div>
      <br/>
      <div>
        <h5>Accept</h5>
        <p>The accept section is defined equivalent to the states section, and it must only contain a subset of strings found within the states section.</p>
        <p>In the case of the example above:</p>
        <code>
          :accept:<br/>
          b
        </code>
      </div>
      <br/>
      <div>
        <h5>Alphabet</h5>
        <p>The alphabet section is also defined as states, but is a different set of strings which defines the available transition symbols.</p>
        <p>As an example:</p>
        <code>
          :alphabet:<br/>
          0<br/>
          1
        </code>
      </div>
      <br/>
      <div>
        <h5>Transitions</h5>
        <p>The transitions section is defined as a list of transitions of the form:</p>
        <code>
          :transitions:<br/>
          state, symbol {'>'} state
        </code>
        <br/>
        <br/>
        <p>As an example:</p>
        <code>
          :transitions:<br/>
          a, 0 {'>'} b<br/>
          a, 1  {'>'} b<br/>
          b, 0 {'>'} b<br/>
          b, 1 {'>'} a
        </code>
      </div>
    </div>
  </Container>
};
