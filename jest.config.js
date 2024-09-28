/* eslint-disable @typescript-eslint/no-var-requires */

const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('./tsconfig')

module.exports = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths),
    '^masterchat$': '<rootDir>/submodule/masterchat/src',
  },
  modulePaths: ['<rootDir>'],
  testRegex: '.*\\.spec\\.ts$',
  testPathIgnorePatterns: [
    '/node_modules/',
    '/submodule/',
  ],
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  coverageDirectory: '../coverage',
  collectCoverageFrom: ['**/*.(t|j)s'],
}
