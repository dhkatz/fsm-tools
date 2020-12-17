import { Edge, Graph, GraphOptions } from "graphlib";

const PATTERNS = {
    STATES: /:states:\s*((\w+\s*)+)/,
    INITIAL: /:initial:\s*(\w+)\s*/,
    ACCEPTING: /:accept:\s*((\w+\s*)+)/,
    ALPHABET: /:alphabet:\s*((\w\s*)+)/,
    TRANSITIONS: /:transitions:\n((\w+\s*,\s*\w+\s*>\s*\w+\n?)*)/
}

/**
 * JSON compatible description of a {@link StateMachine}
 */
export interface StateMachineDescription {
    states: string[],
    initial: string;
    accept?: string[];
    alphabet: string[];
    transitions?: Array<[string, string, string]>;
}

export interface StateMachineOptions extends GraphOptions {
    description?: string | StateMachineDescription;
}

interface Transition extends Edge {
}

/**
 * Graph representation of a finite state machine.
 */
export class StateMachine extends Graph {
    private initial!: string;

    private alphabet: Set<string> = new Set();
    private accepted: Set<string> = new Set();

    public constructor(options?: StateMachineOptions) {
        super({ ...options, multigraph: true });

        this.setGraph({ rankdir: "LR" })
    }

    /**
     * Construct a new {@link StateMachine} from a string or JSON representation.
     * @param {string|StateMachineDescription} description
     * @returns {StateMachine}
     */
    public static parse(description: string | StateMachineDescription): StateMachine {
        if (typeof description === "string") {
            return this.build(parse(description));
        } else {
            return this.build(description);
        }
    }

    /**
     * Check if an input string is accepted by the {@link StateMachine}
     * @param {string} input
     * @returns {boolean}
     */
    public isAccepted(input: string): boolean {
        const node = this.testInput(input);
        return node !== undefined && this.accepted.has(node);
    }

    /**
     * Set the initial state on the state machine.
     * @param initial
     */
    public setInitial(initial: string): this {
        this.initial = initial;

        return this;
    }

    /**
     * Set a state as accepted on the state machine.
     * @param name
     * @param label
     */
    public setAccepted(name: string, label: any): this {
        this.accepted.add(name);

        return this.setNode(name, label) as this;
    }

    /**
     * Add a symbol to the state machine's alphabet.
     * @param name
     * @param label
     */
    public setSymbol(name: string, label: any): this {
        this.alphabet.add(name);

        return this;
    }

    /**
     * Add a transition to the state machine.
     * @param {string} v The starting state.
     * @param {string} w The ending state.
     * @param {string} symbol The symbol for which the transition occurs.
     */
    public setTransition(v: string, w: string, symbol: string): this {
        const edge = this.edge(v, w) as { label: string, symbols: string[] };

        if (edge) {
            if (edge.symbols.includes(symbol)) {
                return this;
            } else {
                return this.setEdge(v, w, { label: `${edge.label},${symbol}`, symbols: [...edge.symbols, symbol] }) as this;
            }
        }

        return this.setEdge(v, w, { label: symbol, symbols: [symbol] }) as this;
    }

    /**
     * Retrieve all transitions on the StateMachine.
     * Alias for {@link StateMachine.edges}
     * @returns {Transition[]}
     */
    public transitions(): Transition[] {
        return this.edges();
    }

    /**
     * Retrieve the data associated with a transition.
     * Alias for {@link StateMachine.edge}
     * @param {Transition} t
     */
    public transition(t: Transition): Transition {
        return this.edge(t);
    }

    /**
     * A unique hash based on the description of the machine.
     */
    public hash(): string {
        return btoa(this.minimize().description());
    }

    /**
     * Build the textual description of this machine.
     * This can be used for debugging or constructing other machines.
     * @returns {string}
     */
    public description(): string {
        if (this.nodes().length === 0) return "";

        let desc = "";
        desc += `:states:\n${this.nodes().join("\n")}\n`;
        desc +=  `:initial:\n${this.initial}\n`;

        if (this.accepted.size > 0) {
            desc += `:accept:\n${[...this.accepted].join("\n")}\n`;
        }

        if (this.alphabet.size > 0) {
            desc += `:alphabet:\n${[...this.alphabet].join("\n")}\n`;
        }

        if (this.transitions().length > 0) {
            desc += `:transitions:\n${
                this.transitions()
                  .map(t => ({ v: t.v, w: t.w, symbols: this.edge(t).symbols}))
                  .flatMap(t => t.symbols.map((c: string) => `${t.v}, ${c} > ${t.w}`))
                  .join("\n")
            }\n`;
        }

        return desc;
    }

    /**
     * Implementation of Hopcroft's algorithm
     * https://en.wikipedia.org/wiki/DFA_minimization
     * @returns {StateMachine} A new {@link StateMachine}
     */
    public minimize(): StateMachine {
        const R = this.reachable();
        const F = this.setIntersect(this.accepted, R);
        const Q = this.setIntersect(this.setDiff(new Set(this.nodes()), F), R);

        let P = [F, Q];
        let W = [F, Q];

        while (W.length > 0) {
            const A = W.pop()!;

            for (const c of this.alphabet) {
                const X = new Set<string>();

                for (const transition of this.transitions()) {
                    const attrs = this.edge(transition);
                    if (attrs.symbols.includes(c)) {
                        for (const state of A) {
                            if (transition.w === state) {
                                X.add(transition.v);
                            }
                        }
                    }
                }

                P = P.flatMap(Y => {
                    const diff = this.setDiff(Y, X);
                    const intr = this.setIntersect(X, Y);
                    if (diff.size > 0 && intr.size > 0) {
                        if (W.includes(Y)) {
                            W.splice(W.indexOf(Y), 1);

                            W.push(intr, diff);
                        } else {
                            W.push(intr.size <= diff.size ? intr : diff);
                        }

                        return [intr, diff];
                    } else {
                        return Y;
                    }
                });
            }
        }

        const K = P.filter(p => p.size > 0);
        const names = new Map<string, string>();

        const M = new StateMachine({ multigraph: true });

        K.forEach(k => {
            const name = [...k].join("");
            k.forEach(s => names.set(s, name));
        });

        K.forEach(k => {
            const s = [...k][0];

            M.setNode(names.get(s)!);

            if (this.accepted.has(s)) {
                M.setAccepted(names.get(s)!, { peripheries: 2 })
            }

            (this.outEdges(s) as Edge[]).forEach(e => {
                this.edge(e).symbols.forEach((c: string) => {
                    M.setTransition(names.get(s)!, names.get(e.w)!, c);
                });
            });
        });

        M.setInitial(names.get(this.initial)!);

        [...this.alphabet].forEach(c => M.setSymbol(c, {}))

        return M;
    }

    public testInput(input: string): string | undefined {
        let node = this.initial;

        for (const c of input) {
            if (!this.alphabet.has(c)) {
                return undefined;
            }

            const edges = this.outEdges(node);

            let found = false;
            if (edges) {
                for (const e of edges) {
                    const edge = this.edge(e);

                    if (edge.symbols.includes(c)) {
                        node = e.w;
                        found = true;
                        break;
                    }
                }
            }

            if (!found) {
                return node;
            }
        }

        return node;
    }

    private static build(description: StateMachineDescription): StateMachine {
        const digraph = new StateMachine();

        const { states, initial, accept, alphabet, transitions } = description;

        if (!states) {
            return digraph;
        }

        if (!initial) {
            throw new Error("Cannot parse StateMachine with no initial state!");
        } else {
            if (!states.includes(initial)) {
                throw new Error("Initial state set to a state that does not exist!");
            }
        }

        if (accept && accept.length > 0 && accept.some(s => !states.includes(s))) {
            throw new Error("Accepted states includes a state that does not exist!");
        }

        if (transitions && transitions.length > 0) {
            if (!alphabet || alphabet.length === 0) {
                throw new Error("Cannot specify transitions with an empty alphabet!");
            }

            if (transitions.some(t => !alphabet.includes(t[1]))) {
                throw new Error("Transition includes a symbol which is not defined in the alphabet!");
            }

            if (transitions.some(t => !states.includes(t[0]) || !states.includes(t[2]))) {
                throw new Error("Transition includes a state which is not defined in states!");
            }
        }

        (alphabet || []).forEach(c => digraph.setSymbol(c, {}));
        states.forEach(s => digraph.setNode(s));
        digraph.setInitial(initial);
        (accept || []).forEach(s => digraph.setAccepted(s, { peripheries: 2 }));
        (transitions || []).forEach(t => digraph.setTransition(t[0], t[2], t[1]));

        return digraph
    }

    private reachable(): Set<string> {
        const start = this.initial;
        const queue = [start];
        const visited = new Set([start]);

        while (queue.length > 0) {
            const current = queue.pop();

            for (const transition of this.transitions()) {
                if (current === transition.v) {
                    if (!visited.has(transition.w)) {
                        visited.add(transition.w);

                        if (!queue.includes(transition.w)) {
                            queue.push(transition.w);
                        }
                    }
                }
            }
        }

        return visited;
    }

    private setDiff<T>(a: Set<T>, b: Set<T>): Set<T> {
        return new Set([...a].filter(value => !b.has(value)));
    }

    private setIntersect<T>(a: Set<T>, b: Set<T>): Set<T> {
        return new Set([...a].filter(value => b.has(value)));
    }
}

export const parse = (input: string): StateMachineDescription => {
    const initial = parse_initial(input)!;
    const states = parse_states(input)!;
    const accept = parse_accepting(input);
    const alphabet = parse_alphabet(input);
    const transitions = parse_transitions(input);

    return { initial, states, accept, alphabet, transitions };
}

const parse_states = (input: string): string[] | null => {
    const statesMatch = PATTERNS.STATES.exec(input);
    return statesMatch && statesMatch[1] ? statesMatch[1].split(/\s+/).map(s => s.trim()).filter(s => s !== "") : null;
}

const parse_initial = (input: string): string | null => {
    const initialMatch = PATTERNS.INITIAL.exec(input);

    return initialMatch && initialMatch[1] ? initialMatch[1] : null;
}

const parse_accepting = (input: string): string[] => {
    const acceptMatch = PATTERNS.ACCEPTING.exec(input);
    return acceptMatch && acceptMatch[1] ? acceptMatch[1].split(/\s+/).map(s => s.trim()).filter(s => s !== "") : [];
}

const parse_alphabet = (input: string): string[] => {
    const alphabetMatch = PATTERNS.ALPHABET.exec(input);
    return alphabetMatch && alphabetMatch[1] ? alphabetMatch[1].split(/\s*/).map(c => c.trim()).filter(c => c !== "") : [];
};

const parse_transitions = (input: string): [string, string, string][] => {
    const transMatch = PATTERNS.TRANSITIONS.exec(input);

    if (!transMatch) {
        return [];
    }

    return [...transMatch[1].matchAll(/(\w+)\s*,\s*(\w+)\s*>\s*(\w+)/g)].map(t => {
        return [t[1], t[2], t[3]];
    });
}
