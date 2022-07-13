import { nodeResolve } from '@rollup/plugin-node-resolve';
import ts from 'rollup-plugin-typescript2'
import path from 'path'

export default {
    input: 'src/index.ts',
    output: {
        file: path.resolve(__dirname, 'dist/index.js'),
        // global: 弄个全局变量来接收
        // cjs: module.exports
        // esm: export default
        // iife: ()()
        // umd: 兼容 amd + commonjs 不支持es6导入
        format: 'iife',
        name: 'di',
        sourcemap: true, // ts中的sourcemap也得变为true
    },
    plugins: [
        nodeResolve({
            extensions: ['.js', '.ts']
        }),
        ts({})
    ]
}