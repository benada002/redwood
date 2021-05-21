import fs from 'fs'
import path from 'path'

import { generateCellTypesDefs } from '../mirrorTypes'
import { ensurePosixPath } from '../paths'

const FIXTURE_PATH = path.resolve(
  __dirname,
  '../../../../__fixtures__/example-todo-main'
)

beforeAll(() => {
  process.env.__REDWOOD__CONFIG_PATH = FIXTURE_PATH
})
afterAll(() => {
  delete process.env.__REDWOOD__CONFIG_PATH
})

it('generates the correct types mirror types for cells', () => {
  const p = generateCellTypesDefs()

  expect(ensurePosixPath(p[0])).toContain(
    '.redwood/mirror/web/src/components/NumTodosCell/index.d.ts'
  )

  expect(fs.readFileSync(p[0], 'utf-8')).toMatchInlineSnapshot(`
    "// This file is generated by RedwoodJS
    import { Success } from './NumTodosCell'
    type SuccessType = typeof Success
    export default function (): ReturnType<SuccessType>
    "
  `)

  expect(ensurePosixPath(p[1])).toContain(
    '.redwood/mirror/web/src/components/TodoListCell/index.d.ts'
  )
})