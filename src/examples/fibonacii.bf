[-]++++++++++  assign 10 to i
>[-]  assign 0 to prev
>[-]++++++++++++++++++++++++++++++++++++++++++++  assign 44 to comma
>[-]++++++++++++++++++++++++++++++++  assign 32 to space
>[-]+  assign 1 to current
>++++++++++<[->>>>>>>>>>>+<<<<<<<+<<<<]>>>>>>>>>>>[-<<<<<<<<<<<+>>>>>>>>>>>]<<<<<<<<<<[->>>>>>>>>>+<<<<<+<<<<<]>>>>>>>>>>[-<<<<<<<<<<+>>>>>>>>>>]<<<<<<<[->+>-[>+>>]>[+[-<+>]>+>>]<<<<<<]<[-]>>>>[-<<<<+>>>>]<<<<<[-]>>>>>>[-<<<<<<+>>>>>>]<<<<[-]>[-]>[-]>[-]>[-]>[-]>[-]<<<<<<<<<[-]  print current
  >[-<+>>>+<<]<[->+<]  copy temporary〔6〕 to temporary〔8〕
print current
  >>>[  if temporary〔6〕
<<++++++++++++++++++++++++++++++++++++++++++++++++.[-]  print current
  >>[-]]  endif temporary〔6〕
<++++++++++++++++++++++++++++++++++++++++++++++++.[-]  print current
<<<<<<<[  while i
  >>>>[->>+<+<]>>[-<<+>>]  add current to sum
  <<<<<[->>>>>+<+<<<<]>>>>>[-<<<<<+>>>>>]  add prev to sum
  <<<<.  print comma
  >.  print space
  >>>++++++++++<[->>>>>>>>>>>+<<<<<<<+<<<<]>>>>>>>>>>>[-<<<<<<<<<<<+>>>>>>>>>>>]<<<<<<<<<<[->>>>>>>>>>+<<<<<+<<<<<]>>>>>>>>>>[-<<<<<<<<<<+>>>>>>>>>>]<<<<<<<[->+>-[>+>>]>[+[-<+>]>+>>]<<<<<<]<[-]>>>>[-<<<<+>>>>]<<<<<[-]>>>>>>[-<<<<<<+>>>>>>]<<<<[-]>[-]>[-]>[-]>[-]>[-]>[-]<<<<<<<<<[-]  print sum
    >[-<+>>>+<<]<[->+<]  copy temporary〔7〕 to temporary〔9〕
  print sum
    >>>[  if temporary〔7〕
  <<++++++++++++++++++++++++++++++++++++++++++++++++.[-]  print sum
    >>[-]]  endif temporary〔7〕
  <++++++++++++++++++++++++++++++++++++++++++++++++.[-]  print sum
  <<<<<<<[-]  assign 0 to prev
  >>>[->>+<<<<<+>>>]>>[-<<+>>]  add current to prev
  <<[-]  assign 0 to current
  >[->+<<+>]>[-<+>]  add sum to current
  <<<<<<-  decrement i with 1
>>>>>[-]<<<<<]  endwhile i