import React, {useEffect, useState} from 'react';
import {Container, Row, Col, InputGroup, FormControl} from 'react-bootstrap';

import { MachineSimulator } from '../components';
import {StateMachine} from "../fsm";

const DEFAULT_MACHINE = `:states:
a
b
:initial:
a
:accept:
b
a
:alphabet:
0
1
:transitions:
a, 0 > b
a, 1 > b
b, 0 > b
b, 1 > a`;

export const Minimizer = () => {
  const [description, setDescription] = useState<string>(DEFAULT_MACHINE);
    const [minimized, setMinimized] = useState<string>("");

    useEffect(() => {
      try {
        const machine = StateMachine.parse(description).minimize();
        console.log(machine);
        setMinimized(machine.description());
      } catch {
        setMinimized({} as any)
      }
    }, [description])

    return (
        <Container>
          <h1>DFA Minimizer</h1>
          <Row>
            <Col>
              <Container>
                <Row>
                  <h2>Input Description</h2>
                  <InputGroup style={{ height: "375px" }}>
                    <InputGroup.Prepend>
                      <InputGroup.Text>Input</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl value={description} as={"textarea"} aria-label="input" onChange={(e) => setDescription(e.target.value)} />
                  </InputGroup>
                </Row>
                <br/>
                <Row>
                  <h2>Input Machine</h2>
                  <MachineSimulator description={description} options={{ height: 200 }} />
                </Row>
              </Container>
            </Col>
            <Col>
              <Container>
                <Row>
                  <h2>Minimized Description</h2>
                  <InputGroup style={{ height: "375px" }}>
                    <InputGroup.Prepend>
                      <InputGroup.Text>Input</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl disabled as={"textarea"} value={minimized} />
                  </InputGroup>
                </Row>
                <br/>
                <Row>
                  <h2>Output Machine</h2>
                  <MachineSimulator description={description} minimize options={{ height: 200 }} />
                </Row>
              </Container>
            </Col>
          </Row>
        </Container>
    )
}
