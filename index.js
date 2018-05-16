const readline = require("readline");

const Instruction = Object.freeze({ Nil: 0, S: 1, Z: 2, M: 3, J: 4 });

const instructions = [];
let registers = [];

const getRegister = i => {
  if (i <= 0) {
    console.error(`can't reference register ${i}`);
    process.exit(2);
  }
  if (i > registers.length) {
    registers = [
      ...registers,
      ...Array.from(Array(i - registers.length)).map(_ => 0),
    ];
  }

  return registers[i - 1];
};

const setRegister = (i, val) => {
  if (i <= 0) {
    console.error(`can't reference register ${i}`);
    process.exit(2);
  }
  if (i > registers.length) {
    registers = [
      ...registers,
      ...Array.from(Array(i - registers.length)).map(_ => 0),
    ];
  }

  registers[i - 1] = val;
};

const parseInstruction = (str, i) => {
  let type = Instruction.Nil;
  let argCount = 0;
  switch (str[0].toUpperCase()) {
    case "S":
      type = Instruction.S;
      argCount = 1;
      break;
    case "Z":
      type = Instruction.Z;
      argCount = 1;
      break;
    case "M":
      type = Instruction.M;
      argCount = 2;
      break;
    case "J":
      type = Instruction.J;
      argCount = 3;
      break;
    default:
      console.error(
        `Error on instruction ${i}:\n  ${str}\n${
          str[0]
        }is not a valid instruction.`,
      );
  }
  const args = str
    .slice(2, -1)
    .split(",")
    .map(s => parseInt(s, 10))
    .filter(x => !isNaN(x));
  if (args.length !== argCount) {
    console.error(`Error on instruction ${i}:
  ${str}
Argument mismatch: ${str[0]} requires ${argCount} arguments, but only ${
      args.length
    } were provided.`);
  }
  return {
    type,
    args,
  };
};

const parseLine = line => {
  if (line !== null) {
    const [i, instr] = line.split(":");
    const num = parseInt(i, 10);
    if (isNaN(num)) {
      console.error(
        `error on this line:\n  ${line}\n${i} is not a valid integer`,
      );
      process.exit(1);
    }
    if (num != instructions.length) {
      console.error(
        `error on this line:\n  ${line}\n${i} should be ${instructions.length}`,
      );
      process.exit(1);
    }
    instructions.push(parseInstruction(instr));
  }
};

const args = process.argv.slice(2);

if (args[0] === "--help") {
  console.log(`URM emulator
---
Provide instructions as STDIN. Format:
i:X(...ARGS)
where "i" is the line number (start at 0), X is an instruction:

S(n)     - increment register n by 1
Z(n)     - set register n to 0
M(m,n)   - copy value of register m to register n
J(m,n,p) - jump to instruction p, if the values of registers m and n are the same


Pass initial register values in as arguments. Each value must be a natural number
(N = {0, 1, 2, ...}).

Execution steps are printed to STDERR. Output (value of register 1) is printed to
STDOUT on termination.
  `);
}

process.stdin.setEncoding("utf-8");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on("line", parseLine);
rl.on("close", () => {
  // now set register values.
  registers = args.map(s => parseInt(s, 10)).filter(x => !isNaN(x));
  // run
  let line = 0;
  while (line < instructions.length && line >= 0) {
    const instr = instructions[line];
    line = line + 1;
    switch (instr.type) {
      case Instruction.J:
        const m = getRegister(instr.args[0]);
        const n = getRegister(instr.args[1]);
        if (m === n) {
          line = instr.args[2];
          console.error(`Jump to ${line}`);
        } else {
          console.error(`No jump`);
        }
        break;
      case Instruction.M: {
        setRegister(instr.args[1], getRegister(instr.args[0]));
        console.error(`R${instr.args[1]} set to ${getRegister(instr.args[0])}`);
        break;
      }
      case Instruction.S: {
        setRegister(instr.args[0], getRegister(instr.args[0]) + 1);
        console.error(`R${instr.args[0]} set to ${getRegister(instr.args[0])}`);
        break;
      }
      case Instruction.Z: {
        setRegister(instr.args[0], 0);
        console.error(`R${instr.args[0]} set to 0`);
        break;
      }
    }
  }
  process.stdout.write(`${getRegister(1)}`);
});
