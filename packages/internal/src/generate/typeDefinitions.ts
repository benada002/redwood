import fs from 'fs'
import path from 'path'

import { findCells, findDirectoryNamedModules } from 'src/files'
import { getJsxElements } from 'src/jsx'
import { getPaths, processPagesDir } from 'src/paths'

import { writeTemplate } from './templates'

// Note for contributors:
//
// The functions in this file generate type definitions.
//
// When generating a new type definition that targets a particular side,
// you must prefix the generated filename with "web-" or "api-"
// to target inclusion for that side, or use "all-" for both.

export const generateTypeDefs = () => {
  const p1 = generateDirectoryNamedModuleTypeDefs()
  const p2 = generateCellTypesDefs()
  const p3 = generateRouterPageImports()
  const p4 = generateCurrentUserTypeDef()
  const p5 = generateRouterRoutesTypeDef()

  return [...p1, ...p2, p3[0], p4[0], p5[0]]
}

export const generateDirectoryNamedModuleTypeDefs = () => {
  const rwjsPaths = getPaths()
  const paths = findDirectoryNamedModules()

  return paths.map((p) => {
    const { dir, name } = path.parse(p)

    const mirrorDir = path.join(
      rwjsPaths.generated.types.mirror,
      dir.replace(rwjsPaths.base, '')
    )
    fs.mkdirSync(mirrorDir, { recursive: true })

    const typeDefPath = path.join(mirrorDir, 'index.d.ts')
    writeTemplate(
      'templates/mirror-directoryNamedModule.d.ts.template',
      typeDefPath,
      {
        name,
      }
    )
    return typeDefPath
  })
}

export const generateCellTypesDefs = () => {
  const rwjsPaths = getPaths()
  const paths = findCells()

  return paths.map((p) => {
    const { dir, name } = path.parse(p)

    const mirrorDir = path.join(
      rwjsPaths.generated.types.mirror,
      dir.replace(rwjsPaths.base, '')
    )
    fs.mkdirSync(mirrorDir, { recursive: true })

    const typeDefPath = path.join(mirrorDir, 'index.d.ts')
    writeTemplate('templates/mirror-cell.d.ts.template', typeDefPath, { name })

    return typeDefPath
  })
}

const writeTypeDefIncludeFile = (
  template: string,
  values: Record<string, unknown> = {}
) => {
  const rwjsPaths = getPaths()
  const typeDefPath = path.join(
    rwjsPaths.generated.types.includes,
    template.replace('.template', '')
  )

  const templateFilename = path.join('templates', template)
  writeTemplate(templateFilename, typeDefPath, values)
  return [typeDefPath]
}

export const generateRouterRoutesTypeDef = () => {
  const code = fs.readFileSync(getPaths().web.routes, 'utf-8')
  const routes = getJsxElements(code, 'Route').filter((x) => {
    // All generated "routes" should have a "name" and "path" prop-value
    return (
      typeof x.props?.path !== 'undefined' &&
      typeof x.props?.name !== 'undefined'
    )
  })

  return writeTypeDefIncludeFile('web-routerRoutes.d.ts.template', { routes })
}

export const generateRouterPageImports = () => {
  const pages = processPagesDir()
  return writeTypeDefIncludeFile('web-routesPages.d.ts.template', { pages })
}

export const generateCurrentUserTypeDef = () => {
  return writeTypeDefIncludeFile('all-currentUser.d.ts.template')
}

export const generateGlobImports = () => {
  return writeTypeDefIncludeFile('api-globImports.d.ts.template')
}

export const generateAPIGlobalContext = () => {
  return writeTypeDefIncludeFile('api-globalContext.d.ts.template')
}