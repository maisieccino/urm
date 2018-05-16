## URM emulator

Provide instructions as STDIN. Format:
i:X(...ARGS)
where "i" is the line number (start at 0), X is an instruction:

S(n) - increment register n by 1
Z(n) - set register n to 0
M(m,n) - copy value of register m to register n
J(m,n,p) - jump to instruction p, if the values of registers m and n are the same

Pass initial register values in as arguments. Each value must be a natural
number (N = {0, 1, 2, ...}).

Execution steps are printed to STDERR. Output (value of register 1) is
printed to STDOUT on termination.

example usage:

[mbell@pc:~]$ node index.js 7 < test.urm 2&>/dev/null

runs the program stored in test.urm, with register 1 set to 7. STDERR output
(containing execution steps) are hidden.
