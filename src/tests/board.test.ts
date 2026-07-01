import { expect, test } from "vitest";
import { Board } from "../firebase/board.svelte";

test("making moves updates gameBoard", () => {
  for (let i = 0; i < 9; i++) {
    let board = new Board();
    board.change(i, "Circle");

    let expected = Array(9).fill(null, 0, 9);
    expected[i] = { tile: "Circle", win: false };
    expect(board.gameBoard).toStrictEqual(expected);
  }
  for (let i = 0; i < 9; i++) {
    let board = new Board();
    board.change(i, "Cross");

    let expected = Array(9).fill(null, 0, 9);
    expected[i] = { tile: "Cross", win: false };
    expect(board.gameBoard).toStrictEqual(expected);
  }
});

test("circle wins if completing row", () => {
  let board = new Board();
  board.change(0, "Circle");
  board.change(1, "Circle");
  board.change(2, "Circle");

  expect(board.state.status).toBe("won");
});

test("cross wins if they complete row", () => {
  let board = new Board();
  board.change(0, "Cross");
  board.change(1, "Cross");
  board.change(2, "Cross");

  expect(board.state.status).toBe("won");
});

test("draws are detected", () => {
  let board = new Board();
  board.$circleList = 0b110001110;
  board.$crossList = 0b001110001;
  board.$updateGameState();

  expect(board.state.status).toBe("draw");
});
