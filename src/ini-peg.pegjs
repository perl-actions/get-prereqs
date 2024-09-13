start
  = @lines eol?

ws
  = [ \t]+

eol
  = "\r"? "\n"

key
  = key:$([^\x00-\x1f\x7f= ] [^\x00-\x1f\x7f=]*)
  { return key.trimEnd() }

value
  = value:$( [^ \t\r\n] ';' / [^\n;] )*
  { return value.trimEnd() }

assignment
  = ws? key:key ws? '=' ws? value:value ws? comment?
  { return { key, value } }

comment
  = ws? ';' comment:$[^\r\n]*
  { return { comment } }

lines
  = assignments:(
    section|1|
    / assignment|1|
    / comment|1|
    / ws?             { return [] }
  )|.., eol+|
  {
    return assignments.flat();
  }

section
  = ws? '[' ws? name:$[^\]]+ ws? ']' ws?
  {
    return { section: name.trimEnd() };
  }
