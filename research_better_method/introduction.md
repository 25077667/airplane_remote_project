research to improve performance
===
::: reduce the wireless delay :::

1. small cell
2. divide channel
3. oriented channel
4. physical isolation
5. can anyone give me more good way?

i will use all idea above to compare with origin.

in nano_sec_result/
i use nano second to sleep because i found the origin is not close to the truth enought.
it often send 44 bytes in a packet, 44*8 = 352bits
352/2.4Ghz = 146.66... nano seconds

and the condition window will be this sequence 7 15 31 63 127 255 255 255...
that is 2 to the power of (n+3) 
n is ∈ ℕ-1