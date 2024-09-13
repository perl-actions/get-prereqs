Start = @Lines
WS = [ \t]+
EOL = "\r"? "\n"

Key = key:$( [^\x00-\x1f\x7f= ] [^\x00-\x1f\x7f=]* )
  { return key.trimEnd() }

Value = value:$( [^ \t\r\n] ";" / [^\n;] )*
  { return value.trimEnd() }

Assignment = WS? key:Key WS? "=" WS? value:Value WS? Comment?
  { return { key, value } }

Comment = WS? ";" comment:$[^\r\n]*
  { return { comment } }

Lines = assignments:(
    Section|1|
    / Assignment|1|
    / Comment|1|
    / WS?             { return [] }
  )|.., EOL+| EOL?
  { return assignments.flat(); }

Section = WS? "[" WS? name:$[^\]]+ WS? "]" WS?
  { return { section: name.trimEnd() }; }
