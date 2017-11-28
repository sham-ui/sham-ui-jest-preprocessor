const jestTransformer = require( 'babel-jest' );
const Compiler = require( 'sham-ui-templates' ).Compiler;

const compiler = new Compiler( { asModule: true } );

function transfromCode( code ) {
    return code
        .replace(
            "var ShamUIView = require('sham-ui-templates').default;",
            "var ShamUIView = require('sham-ui-templates/sham-ui-widget').default;"
        );
}

module.exports = {
    process( src, filename, config, transformOptions ) {
        if ( filename.endsWith( '.sht' ) ) {
            try {
                let code = compiler.compile( filename, src ).toString();
                code = transfromCode( code );
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