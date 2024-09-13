{{
  import { fullVersion } from './cpan-versions.mjs';
}}

start
  = reqs:declarations
  {
    return reqs.map(req => ({
      phase: 'runtime',
      ...req,
      version: fullVersion(req.version.toString()),
    }));
  }

ws
  = [ \t\n\r]+

comment
  = '#' [^\n]* ("\n" / !. )

_
  = (
    [ \t\n\r]+
    / comment
  )*

value
  = undef
  / string
  / vstring
  / number

statement_sep
  = ( _ ';' _ )+

list_sep
  = ( _ ( ',' / '=>' ) _ )+

bareword
  = [_a-z]i [_a-z0-9]i*

quoted_bareword
  = @$bareword &(ws? '=>')

integer
  = digits:$[0-9]+ { return parseInt(digits, 10) }

decimal
  = number:$([0-9] [0-9_]* '.' [0-9_]*) { return parseFloat(number.replace(/_/, '')) }

number
  = decimal
  / integer

undef
  = 'undef' { return null }

vstring
  = version:(
    integer|3.., '.'|
    / 'v' @integer|1.., '.'|
  ) { return 'v' + version.join('.') }

pairs
  = '[' @$[^\\\]]* ']'
  / '{' @$[^\\\}]* '}'
  / '(' @$[^\\\)]* ')'
  / '<' @$[^\\\>]* '>'
  / '"' @$[^\\\"]* '"'
  / '\'' @$[^\\\']* '\''

string
  = '"' @$[^\\\"$@]* '"'
  / '\'' @$[^\\\']* '\''
  / 'qq' @pairs
  / 'q' @pairs

phase
  = 'configure'
  / 'build'
  / 'test'
  / 'runtime'
  / 'develop'

parameter
  = value
  / quoted_bareword

parameters
  = list_sep? @parameter|1.., list_sep| list_sep?

pragma
  = 'use strict'
  / 'use warnings'
  / 'use ' 'v'? [0-9] ( '.' [0-9]+ )*

declarations
  = _ statement_sep?
    reqs:(
      requirement|1|
      / phase_block
      / feature_block
      / pragma { return [] }
      / '1' { return [] }
    )|.., statement_sep|
    statement_sep? _
    { return reqs.flat() }

end_bareword
  = !([0-9a-z_']i / ws? '=>')

requirements
  = _ statement_sep?
    @requirement|.., statement_sep|
    statement_sep? _

feature_block_params
  = feature:parameter list_sep
    description:(@parameter list_sep)?
    'sub' _ '{' reqs:declarations '}'
    { return reqs.map(req => ({ ...req, feature, description})) }

feature_block
  = 'feature' end_bareword _ @(
      '(' _ @feature_block_params _ ')'
      / @feature_block_params
    )

phase_block_params
  = phase:parameter list_sep
    'sub' _ '{' reqs:declarations '}'
    { return reqs.map(req => ({ ...req, phase })) }

phase_block
  = 'on' end_bareword _ @(
      '(' _ @phase_block_params _ ')'
      / @phase_block_params
    )

requirement
  = type:(
      relationship:relationship   { return { relationship } }
      / phase:phase_sub           { return { phase, relationship: 'requires' } }
    ) end_bareword _
    params:(
      '(' _ @parameters _ ')'
      / @parameters
    )
    { return { prereq: params[0], version: params[1] || 0, ...type } }

relationship
  = 'requires'
  / 'recommends'
  / 'suggests'
  / 'conflicts'

phase_sub
  = 'configure_requires'  { return 'configure' }
  / 'build_requires'      { return 'build' }
  / 'test_requires'       { return 'test' }
  / 'author_requires'     { return 'develop' }
