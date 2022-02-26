,  write input input
------------------------------------------------  decrement input with 48
[->>+<+<]>>[-<<+>>]  add input to acc
<<,  write input input
  >>[-]++++++++++  assign 10 to ten
  <<[  while input
    ------------------------------------------------  decrement input with 48
    multiply ten to acc
      >>[->+>+<<]>[-<+>]  copy ten to temporary〔4〕
    >[-<<<[->>+>>+<<<<]>>[-<<+>>]>]<[-]<<[-]>>>>[-<<<<+>>>>]  multiply ten to acc
    <<<<<[->>>+<<+<]>>>[-<<<+>>>]  add input to acc
    <<<,  write input input
  ]  endwhile input
>>[-]  declare space
[-]++++++++++++++++++++++++++++++++  assign 32 to space
>[-]++++++++++++++++++++++++++++++++++++++++++  assign 42 to star
>[-]++++++++++  assign 10 to endLine
<<<[->>>>>+<+<<<<]>>>>>[-<<<<<+>>>>>]  add acc to spacesCount
<-  decrement spacesCount with 1
>+  increment starCount with 1
times acc
  <<<<<[->>>>>>+>+<<<<<<<]>>>>>>[-<<<<<<+>>>>>>]  copy acc to temporary〔8〕
times acc
  >[  while temporary〔8〕
  times acc
    times spacesCount
      <<<[->>+>>+<<<<]>>[-<<+>>]  copy spacesCount to temporary〔9〕
    times spacesCount
      >>[  while temporary〔9〕
      times spacesCount
        <<<<<<<.  print space
    >>>>>>>-  times spacesCount
      ]  endwhile temporary〔9〕
  times acc
    times starCount
      <<<[->>>+>+<<<<]>>>[-<<<+>>>]  copy starCount to temporary〔10〕
    times starCount
      >[  while temporary〔10〕
      times starCount
        <<<<<<<.  print star
    >>>>>>>-  times starCount
      ]  endwhile temporary〔10〕
  times acc
    <<<<<[->>>>>+<+<<<<]>>>>>[-<<<<<+>>>>>]  copy spacesCount to temporary〔9〕
  times acc
    <[  if spacesCount
    times acc
      <<<<<.  print endLine
  times acc
    >>>>>[-]]  endif spacesCount
  times acc
    <<<<-  decrement spacesCount with 1
  times acc
    >++  increment starCount with 2
>>-  times acc
  ]  endwhile temporary〔8〕