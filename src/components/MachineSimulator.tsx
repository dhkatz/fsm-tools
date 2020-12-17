import React, { FunctionComponent, useState, useEffect } from 'react';
import { Graphviz, IGraphvizProps } from 'graphviz-react';

import dot from "graphlib-dot";
import {StateMachine, StateMachineDescription} from '../fsm';

interface Props extends Omit<IGraphvizProps, "dot"> { minimize?: boolean; description: string | StateMachineDescription; input?: string | null; }

export const MachineSimulator: FunctionComponent<Props> = ({ minimize, description, input, ...props }) => {
    const [error, setError] = useState("");
    const [parsed, setParsed] = useState<string | null>(null);

    useEffect(() => {
        try {
            const graph = StateMachine.parse(description);
            const fsm = minimize ? graph.minimize() : graph;

            if (input !== null) {
                const finalNode = fsm.testInput(input || "");
                if (finalNode) {
                    const node = fsm.node(finalNode);
                    fsm.setNode(finalNode, { ...node, fillcolor: "#f54f4c", style: "filled" });
                }
            }

            const output = minimize ? dot.write(graph.minimize()) : dot.write(graph);
            dot.read(output);
            setParsed(output);
            setError('');
        } catch (e) {
            setError(`${e.name}: ${e.message}`);
            setParsed(null);
        }

        return () => {
            setParsed(null);
        }
    }, [description, minimize, input])

    return (
        parsed ? <Graphviz dot={parsed} {...props}/> : <div>{error}</div>
    )
}

MachineSimulator.defaultProps = {
    minimize: false,
    input: null
}
