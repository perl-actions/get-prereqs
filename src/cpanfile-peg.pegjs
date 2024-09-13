{{
  import { fullVersion } from "./cpan-versions.mjs";
}}

Start = reqs:Declarations
  {
    return reqs.map(req => ({
      phase: "runtime",
      ...req,
      version: fullVersion(req.version.toString()),
    }));
  }

WS = [ \t\n\r]+

Comment = "#" [^\n]* ( "\n" / !. )

_ = ( [ \t\n\r]+ / Comment )*

Value
  = Undef
  / String
  / VString
  / Number

StatementSep = ( _ ";" _ )+

ListSep = ( _ ( "," / "=>" ) _ )+

Bareword = [_a-z]i [_a-z0-9]i*

QuotedBareword = @$Bareword &( WS? "=>" )

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

Pairs
  = "[" @$[^\\\]]* "]"
  / "{" @$[^\\\}]* "}"
  / "(" @$[^\\\)]* ")"
  / "<" @$[^\\\>]* ">"
  / "'" @$[^\\\']* "'"
  / "\"" @$[^\\\"]* "\""

String
  = "'" @$[^\\\'$@]* "'"
  / "\"" @$[^\\\"$@]* "\""
  / "qq" @Pairs
  / "q" @Pairs

Parameter
  = Value
  / QuotedBareword

Parameters = ListSep? @Parameter|1.., ListSep| ListSep?

Pragma
  = "use strict"
  / "use warnings"
  / "use " "v"? [0-9] ( "." [0-9]+ )*

Declarations = _
  StatementSep?
  reqs:(
    Requirement|1|
    / PhaseBlock
    / FeatureBlock
    / Pragma { return [] }
    / "1" { return [] }
  )|.., StatementSep|
  StatementSep? _
  { return reqs.flat() }

EndBareword = !( [0-9a-z_']i / WS? "=>" )

FeatureBlockParams = feature:Parameter ListSep
  description:( @Parameter ListSep )?
  "sub" _ "{" reqs:Declarations "}"
  { return reqs.map(req => ({ ...req, feature, description})) }

FeatureBlock = "feature" EndBareword _
  @(
    "(" _ @FeatureBlockParams _ ")"
    / @FeatureBlockParams
  )

PhaseBlockParams = phase:Parameter ListSep
  "sub" _ "{" reqs:Declarations "}"
  { return reqs.map(req => ({ ...req, phase })) }

PhaseBlock = "on" EndBareword _
  @(
    "(" _ @PhaseBlockParams _ ")"
    / @PhaseBlockParams
  )

/*
Phase
  = "configure"
  / "build"
  / "test"
  / "runtime"
  / "develop"
*/

Requirement = type:(
    relationship:Relationship   { return { relationship } }
    / phase:PhaseSub            { return { phase, relationship: "requires" } }
  ) EndBareword _
  params:(
    "(" _ @Parameters _ ")"
    / @Parameters
  )
  { return { prereq: params[0], version: params[1] || 0, ...type } }

Relationship
  = "requires"
  / "recommends"
  / "suggests"
  / "conflicts"

PhaseSub
  = "configure_requires"  { return "configure" }
  / "build_requires"      { return "build" }
  / "test_requires"       { return "test" }
  / "author_requires"     { return "develop" }
