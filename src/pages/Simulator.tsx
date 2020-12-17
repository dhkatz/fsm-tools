import React, {useEffect, useState} from 'react';
import {Container, InputGroup, FormControl, Row, Col} from 'react-bootstrap';

import { MachineSimulator } from '../components';
import {StateMachine} from "../fsm";

export const Simulator = () => {
    const [description, setDescription] = useState<string>(DEFAULT_MACHINE);
    const [input, setInput] = useState("");
    const [accepted, setAccepted] = useState(false);
    const [hash, setHash] = useState("");

    useEffect(() => {
        try {
            const machine = StateMachine.parse(description);
            setAccepted(machine.isAccepted(input));
            setHash(machine.hash());
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
                      <FormControl as={"textarea"} aria-label="input" value={description} onChange={(e) => setDescription(e.target.value)} />
                  </InputGroup>
                  <br/>
                  <InputGroup style={{ height: "90px"}}>
                      <InputGroup.Prepend>
                          <InputGroup.Text>Hash</InputGroup.Text>
                      </InputGroup.Prepend>
                      <FormControl disabled as={"textarea"} aria-label="input" value={hash} />
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

const DEFAULT_MACHINE = `:states:
a
b
c
d
:initial:
a
:accept:
c
:alphabet:
0
1
:transitions:
a,0>b
a,1>a
b,0>d
b,1>c
c,0>c
c,1>b
d,0>d
d,1>c`;
