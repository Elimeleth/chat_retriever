const { join } = require('path')
const typescript = require('@rollup/plugin-typescript')

const banner = {
    "banner.output": [
        "/** \n",
        "* NO TOCAR ESTE ARCHIVO: Es generado automaticamente, si sabes lo que haces adelante ;)\n",
        "* de lo contrario mejor ir a la documentacion o al servidor de discord link.codigoencasa.com/DISCORD\n",
        "*/"
    ]
}

module.exports = [
    {
        input: join(__dirname, 'chat_runnable.ts'),
        output: {
            banner: banner['banner.output'].join(''),
            file: join(__dirname, 'lib', 'index.cjs'),
            format: 'cjs',
        },
        plugins: [typescript()],
    }
]