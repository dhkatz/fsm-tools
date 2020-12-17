import React, {useEffect, useState} from 'react';
import {Container, InputGroup, FormControl, Row, Col} from 'react-bootstrap';

import { MachineSimulator } from '../components';
import {StateMachine} from "../fsm";

export const Simulator = () => {
    const [description, setDescription] = useState<string>("");
    const [input, setInput] = useState("");
    const [accepted, setAccepted] = useState(false);

    useEffect(() => {
        try {
            const machine = StateMachine.parse(description);
            console.log(machine);
            setAccepted(machine.isAccepted(input));
        } catch {
            setAccepted(false);
        }
    }, [description, input]);

    return (
      <Container>
          <h1>DFA Simulator</h1>
          <Row>
              <Col>
                  <h2>Input Description</h2>
                  <InputGroup style={{ height: "375px" }}>
                      <InputGroup.Prepend>
                          <InputGroup.Text>Input</InputGroup.Text>
                      </InputGroup.Prepend>
                      <FormControl as={"textarea"} aria-label="input" onChange={(e) => setDescription(e.target.value)} />
                  </InputGroup>
              </Col>
              <Col>
                  <h2>Simulate Input</h2>
                  <InputGroup>
                      <InputGroup.Prepend>
                          <InputGroup.Text>Input</InputGroup.Text>
                      </InputGroup.Prepend>
                      <FormControl aria-label="input" onChange={(e) => setInput(e.target.value)} />
                  </InputGroup>
                  <br/>
                  <h4>Input is {accepted ? "ACCEPTED" : "NOT ACCEPTED"}.</h4>
                  <MachineSimulator description={description} input={input} options={{ height: 200 }} />
              </Col>
          </Row>
      </Container>
    )
}
