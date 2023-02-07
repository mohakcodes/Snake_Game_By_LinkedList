import React , {useEffect, useState, useRef} from 'react';
import {randomNumberGeneration , reverseLinkedList , useInterval} from '../lib/utils.js';
import './Board.css';

const BOARD_SIZE = 12;
const PROBABILITY_OF_REVERSING_FOOD = 0.3;

const Direction = {
    UP : 'UP',
    RIGHT : 'RIGHT',
    DOWN : 'DOWN',
    LEFT : 'LEFT',
};

class LinkedListNode
{
    constructor(value)
    {
        this.value = value;
        this.next = null;
    }
};

class LinkedList
{
    constructor(value)
    {
        const node = new LinkedListNode(value);
        this.head = node;
        this.tail = node;
    }
};

const createBoard = (BOARD_SIZE) => {
    let counter = 1;
    const board = [];
    for(let row = 0 ; row < BOARD_SIZE ; row++)
    {
        const currRow = [];
        for(let col = 0 ; col < BOARD_SIZE ; col++)
        {
            currRow.push(counter++);
        }
        board.push(currRow);
    }
    return board;
};

const getSnakesFirstHead = (board) => {
    const rowSize = board.length;
    const colSize = board[0].length;
    const stRow = Math.round(rowSize/3);
    const stCol = Math.round(colSize/3);
    const stCell = board[stRow][stCol];
    return {
        row : stRow,
        col : stCol,
        cell : stCell,
    }
};

const getDirectionFrom = (key) => {
    if(key === 'ArrowUp') return Direction.UP;
    if(key === 'ArrowRight') return Direction.RIGHT;
    if(key === 'ArrowDown') return Direction.DOWN;
    if(key === 'ArrowLeft') return Direction.LEFT;
    return '';
};

const getOppDirection = (direction) => {
    if (direction === Direction.UP) return Direction.DOWN;
    if (direction === Direction.RIGHT) return Direction.LEFT;
    if (direction === Direction.DOWN) return Direction.UP;
    if (direction === Direction.LEFT) return Direction.RIGHT;
};

const getNextHeadCoords = (coords, direction) => {
  if (direction === Direction.UP) {
    return {
      row: coords.row - 1,
      col: coords.col,
    };
  }
  if (direction === Direction.RIGHT) {
    return {
      row: coords.row,
      col: coords.col + 1,
    };
  }
  if (direction === Direction.DOWN) {
    return {
      row: coords.row + 1,
      col: coords.col,
    };
  }
  if (direction === Direction.LEFT) {
    return {
      row: coords.row,
      col: coords.col - 1,
    };
  }
};

const outOfBoundCoord = (coord, board) => {
  const {row, col} = coord;
  if (row < 0 || col < 0 || row >= board.length || col >= board[0].length) return true;
  return false;
};

const Board = () => {

    const [score , setScore] = useState(0);
    const [board , setBoard] = useState(createBoard(BOARD_SIZE));
    const [snake , setSnake] = useState(new LinkedList(getSnakesFirstHead(board)));

    const [snakeCells , _setSnakeCells] = useState(new Set([snake.head.value.cell]));
    const snakeCellsUseRefHook = useRef(snakeCells);
    const setSnakeCells = (newSnakeCells) => {
        snakeCellsUseRefHook.current = newSnakeCells;
        _setSnakeCells(newSnakeCells);
    }

    const [direction , _setDirection] = useState(Direction.RIGHT);
    const directionUseRefHook = useRef(Direction.RIGHT);
    const setDirection = (direction) => {
        directionUseRefHook.current = direction;
        _setDirection(direction);
    }
    
    const [foodCell , setFoodCell] = useState(snake.head.value.cell + 5);
    const [reversingFood , setReversingFood] = useState(false);



    const moveSnake = () => {
        const currentHeadCoords = {
            row : snake.head.value.row,
            col : snake.head.value.col,
        }
        
        const nextHeadCoords = getNextHeadCoords(currentHeadCoords , direction);
        if(outOfBoundCoord(nextHeadCoords , board))
        {
            handleGameOver();
            return;
        }

        const nextHeadCell = board[nextHeadCoords.row][nextHeadCoords.col];
        if(snakeCells.has(nextHeadCell))
        {
            handleGameOver();
            return;
        }

        const newHead = new LinkedListNode({
            row : nextHeadCoords.row,
            col : nextHeadCoords.col,
            cell : nextHeadCell,
        });

        const currHead = snake.head;
        snake.head = newHead;
        currHead.next = newHead;

        const newSnakeCells = new Set(snakeCells);
        newSnakeCells.delete(snake.tail.value.cell);
        newSnakeCells.add(nextHeadCell);

        snake.tail = snake.tail.next;
        if(snake.tail === null) snake.tail = snake.head;

        const foodIsAhead = (nextHeadCell === foodCell);
        if(foodIsAhead)
        {
            growSnake(newSnakeCells);
            if(reversingFood) reverseSnake();
            getNewFoodOnBoard(newSnakeCells);
        }

        setSnakeCells(newSnakeCells);
    }



    const handleGameOver = () => {
        setScore(0);
        const snakeRestart = getSnakesFirstHead(board);
        setSnake(new LinkedList(snakeRestart));
        setSnakeCells(new Set([snakeRestart.cell]));
        setDirection(Direction.RIGHT);
        setFoodCell(snakeRestart.cell + 5);
    }


    const getNewFoodOnBoard = () => {
        const maxPossibleCellValue = BOARD_SIZE * BOARD_SIZE;
        let nextFoodCell;
        while(true)
        {
            nextFoodCell = randomNumberGeneration(1 , maxPossibleCellValue);
            if(snakeCells.has(nextFoodCell) || foodCell === nextFoodCell) continue;
            break;
        }

        const nextIsReversingFood = Math.random() < PROBABILITY_OF_REVERSING_FOOD;
        setFoodCell(nextFoodCell);
        setReversingFood(nextIsReversingFood);
        setScore(score+1);
    }


    const getTailsNextDirection = (node , direction) => {
        if(node.next === null) return direction;
        const {row:currRow , col:currCol} = node.value;
        const {row:nextRow , col:nextCol} = node.next.value;

        if(nextRow === currRow && nextCol === currCol + 1)
        {
            return Direction.RIGHT;
        }
        if(nextRow === currRow && nextCol === currCol - 1)
        {
            return Direction.LEFT;
        }
        if(nextCol === currCol && nextRow === currRow + 1)
        {
            return Direction.DOWN;
        }
        if(nextCol === currCol && nextRow === currRow - 1)
        {
            return Direction.UP;
        }
        return '';
    }


    const getGrownNodeCoord = (snakeTail , direction) => {
        const whereWillTailMove = getTailsNextDirection(snakeTail , direction);
        const whereWillTailGrow = getOppDirection(whereWillTailMove);

        const currTailCoords = {
            row : snakeTail.value.row,
            col : snakeTail.value.col,
        };

        const coordOfGrownNode = getNextHeadCoords(currTailCoords , whereWillTailGrow);
        return coordOfGrownNode;
    }


    //snake will grow from tail end
    const growSnake = (newSnakeCells) => {
        const coordOfGrownNode = getGrownNodeCoord(snake.tail , direction);
        if(outOfBoundCoord(coordOfGrownNode , board))
        {
            //can't grow more
            return;
        }
        const newTailCell = board[coordOfGrownNode.row][coordOfGrownNode.col];
        const newTail = new LinkedListNode({
            row : coordOfGrownNode.row,
            col : coordOfGrownNode.col,
            cell : newTailCell,
        })

        const currTail = snake.tail;
        snake.tail = newTail;
        snake.tail.next = currTail;

        newSnakeCells.add(newTailCell);
    }


    const reverseSnake = () => {
        const whereWillTailMove = getTailsNextDirection(snake.tail , direction);
        const whereWillTailGrow = getOppDirection(whereWillTailMove);
        setDirection(whereWillTailGrow);

        const snakeHead = reverseLinkedList(snake.tail);
        snake.head = snake.tail;
        snake.tail = snakeHead;
    }

    useEffect(()=>{
        window.addEventListener("keydown" , e => {
            const handleKeyDown = (e) => {
                const currDirection = getDirectionFrom(e.key);
                const isValidDirection = currDirection !== '';
                if(!isValidDirection) return;
                
                const snakeSelfBite = (getOppDirection(currDirection) === directionUseRefHook.current && snakeCellsUseRefHook.current.size > 1);
                if(snakeSelfBite) return;

                setDirection(currDirection);
            }
            handleKeyDown(e);
        })
    });
    
    useInterval(()=>{moveSnake()},300)

  return (
    <>
      <h1 className='current_score'>Score : {score}</h1>
      <div className="board">
        {
            board.map((row, rowIdx) => (
                <div key={rowIdx} className="row">
                    {
                        row.map((cellValue, cellIdx) => {
                        let className = "cell";
                        if(cellValue === foodCell)
                        {
                            if(reversingFood)
                            {
                                className = "cell cell-purple";
                            }
                            else
                            {
                                className = "cell cell-red";
                            }
                        }

                        if(snakeCells.has(cellValue) && cellValue === snake.head.value.cell)
                        {
                            className = "cell cell-green cell-dark-green"
                            return <div key={cellIdx} className={className}></div>;
                        }

                        if(snakeCells.has(cellValue)) className = "cell cell-green";
                        return <div key={cellIdx} className={className}></div>;
                    })}
                </div>
            ))}
      </div>
      <p>Use (↑ ↓ → ← ) For Controls</p>
      <h6>🟥 : Normal Food <br /> 🟪 : Reversing Food</h6>
      <p className='footer'>Created By <a href="https://github.com/mohakcodes">Mohak</a> </p>
    </>
  );
};

export default Board;