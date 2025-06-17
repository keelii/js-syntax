import { Parser } from 'acorn'
import jsx from 'acorn-jsx'


export const MyParser = Parser.extend(
  jsx(),
)
