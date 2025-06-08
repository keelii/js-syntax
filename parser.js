import { Parser } from 'acorn'
import jsx from 'acorn-jsx'
import bigint from 'acorn-bigint'

export const MyParser = Parser.extend(
  jsx(),
  bigint
)
