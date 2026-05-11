#!/usr/bin/env python3
"""Train a tiny neural network from scratch.

This is not a route to becoming a production AI system. It is a small,
measurable training exercise: a two-layer neural network learns XOR by
adjusting weights with gradient descent.
"""

from __future__ import annotations

import math
import random


TRAINING_DATA = [
    ([0.0, 0.0], 0.0),
    ([0.0, 1.0], 1.0),
    ([1.0, 0.0], 1.0),
    ([1.0, 1.0], 0.0),
]


class TinyNetwork:
    """A 2-2-1 neural network trained with plain backpropagation."""

    def __init__(self, seed: int = 0) -> None:
        rng = random.Random(seed)
        self.hidden_weights = [[rng.uniform(-1, 1) for _ in range(2)] for _ in range(2)]
        self.hidden_biases = [rng.uniform(-1, 1) for _ in range(2)]
        self.output_weights = [rng.uniform(-1, 1) for _ in range(2)]
        self.output_bias = rng.uniform(-1, 1)

    @staticmethod
    def sigmoid(value: float) -> float:
        return 1.0 / (1.0 + math.exp(-value))

    @staticmethod
    def sigmoid_derivative(sigmoid_output: float) -> float:
        return sigmoid_output * (1.0 - sigmoid_output)

    def predict(self, inputs: list[float]) -> float:
        hidden = self._hidden_outputs(inputs)
        output_sum = sum(weight * value for weight, value in zip(self.output_weights, hidden))
        return self.sigmoid(output_sum + self.output_bias)

    def train(self, epochs: int = 5_000, learning_rate: float = 1.0) -> None:
        for epoch in range(1, epochs + 1):
            total_loss = 0.0

            for inputs, target in TRAINING_DATA:
                hidden = self._hidden_outputs(inputs)
                prediction = self.predict(inputs)
                error = prediction - target
                total_loss += error * error

                output_delta = error * self.sigmoid_derivative(prediction)
                hidden_deltas = [
                    output_delta * self.output_weights[i] * self.sigmoid_derivative(hidden[i])
                    for i in range(2)
                ]

                for i in range(2):
                    self.output_weights[i] -= learning_rate * output_delta * hidden[i]
                self.output_bias -= learning_rate * output_delta

                for neuron in range(2):
                    for input_index in range(2):
                        self.hidden_weights[neuron][input_index] -= (
                            learning_rate * hidden_deltas[neuron] * inputs[input_index]
                        )
                    self.hidden_biases[neuron] -= learning_rate * hidden_deltas[neuron]

            if epoch % 2_000 == 0:
                print(f"epoch {epoch:5d} loss={total_loss / len(TRAINING_DATA):.6f}")

    def _hidden_outputs(self, inputs: list[float]) -> list[float]:
        return [
            self.sigmoid(sum(weight * value for weight, value in zip(weights, inputs)) + bias)
            for weights, bias in zip(self.hidden_weights, self.hidden_biases)
        ]


def main() -> None:
    network = TinyNetwork()
    network.train()

    print("\nTrained XOR predictions:")
    for inputs, target in TRAINING_DATA:
        prediction = network.predict(inputs)
        print(f"{inputs} -> {prediction:.3f} (target {target:.0f})")

    print("\nProven: the loss decreased on this tiny dataset.")
    print("Hypothesized: the same training loop can teach larger networks richer patterns.")
    print("Speculative: this toy captures anything close to human-like intelligence.")


if __name__ == "__main__":
    main()
