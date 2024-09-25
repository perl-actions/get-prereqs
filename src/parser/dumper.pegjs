Start = WrappedDump

WS = [ \t\n\r]+

Comment = "#" [^\n]* ( "\n" / !. )

_ = ( WS / Comment )*

Integer = digits:$[0-9]+
  { return parseInt(digits, 10) }

Decimal = number:$( [0-9] [0-9_]* "." [0-9_]* )
  { return parseFloat(number.replace(/_/, "")) }

Number
  = Decimal
  / Integer

Undef = "undef" { return null }

VString = version:(
    Integer|3.., "."|
    / "v" @Integer|1.., "."|
  )
  { return "v" + version.join(".") }

Value
  = Undef
  / String
  / VString
  / Number
  / Hash

ListSep = ( _ ( "," / "=>" ) _ )+

/*
Bareword = [_a-z]i [_a-z0-9]i*

QuotedBareword = @$Bareword &( WS? "=>" )
*/

String = "'" @$[^\\\'$@]* "'"

WrappedDump = "do" _ "{" _ "my" _ "$x" _ "=" _ @Hash _ ";" _ "$x" _ ";" _ "}" _ ";"?

HashPair = key:String ListSep value:Value
  { return { [key]: value } }

Hash = "{" _ pairs:HashPair|.., ListSep| ListSep? _ "}"
  { return Object.assign({}, ...pairs) }
