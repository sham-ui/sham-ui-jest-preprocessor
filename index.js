const jestTransformer = require( 'babel-jest' );
const Compiler = require( 'sham-ui-templates' ).Compiler;

const asModuleCompiler = new Compiler( { asModule: true } );
const singleFileWidgetCompiler = new Compiler( { asModule: false, asSingleFileWidget: true } );

module.exports = {
    process( src, filename, config, transformOptions ) {
        if ( filename.endsWith( '.sht' ) || filename.endsWith( '.sfw' ) ) {
            try {
                const compiler = filename.endsWith( '.sfw' ) ?
                    singleFileWidgetCompiler :
                    asModuleCompiler;
                let code = compiler.compile( filename, src ).toString();
                code = `require('sham-ui');\n${code}`;
                code = jestTransformer.process( code, filename, config, transformOptions );
                return code;
            } catch ( error ) {
                console.error( error );
                return src;
            }
        }
        return src;
    }
};