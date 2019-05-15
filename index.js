const jestTransformer = require( 'babel-jest' );
const { SourceNode, SourceMapGenerator, SourceMapConsumer } = require( 'source-map' );
const Compiler = require( 'sham-ui-templates' ).Compiler;

const asModuleCompiler = new Compiler( { asModule: true } );
const singleFileWidgetCompiler = new Compiler( { asModule: false, asSingleFileWidget: true } );

function getScriptCode( source ) {
    return source.match(
        /<\s*template[^>]*>[\S\s]*?<\s*\/\s*template>[\S\s]*<\s*script[^>]*>([\S\s]*?)<\s*\/\s*script>/i
    )[ 1 ];
}

function findLine( content, chunk ) {
    return content.substr( 0, content.indexOf( chunk ) ).split( '\n' ).length
}

function convertMapForSFW( src, filename, afterCompileCode, jestResult ) {
    const scriptText = getScriptCode( src );
    const scriptLine = findLine( src, scriptText );
    const scriptLineAfterCompile = findLine( afterCompileCode, scriptText );
    const lineDelta = scriptLineAfterCompile - scriptLine;
    const mapGenerator = new SourceMapGenerator( { file: filename } );
    const jestConsumer = new SourceMapConsumer( jestResult.map );
    jestConsumer.eachMapping( ( m ) => {
        if ( null === m.originalLine ) {
            return;
        }
        if ( m.originalLine < scriptLineAfterCompile ) {
            return;
        }
        mapGenerator.addMapping( {
            source: filename,
            generated: {
                line: m.generatedLine,
                column: m.generatedColumn
            },
            original: {
                line: m.originalLine - lineDelta,
                column: m.originalColumn
            },
            name: m.name
        } )
    } );
    return {
        code: jestResult.code,
        map: mapGenerator.toString()
    };
}

module.exports = {
    process( src, filename, config, transformOptions ) {
        try {
            const isSingleFileWidget = filename.endsWith( '.sfw' );
            const compiler = isSingleFileWidget ?
                singleFileWidgetCompiler :
                asModuleCompiler;
            const widgetNode = new SourceNode( null, null, null, '' );
            widgetNode.add( [
                'require(\'sham-ui\');\n',
                compiler.compile( filename, src )
            ] );
            const afterCompileCode = widgetNode.toString();
            const jestResult = jestTransformer.process(
                afterCompileCode,
                filename,
                config,
                { ...transformOptions, instrument: false }
            );
            if ( isSingleFileWidget ) {
                return convertMapForSFW( src, filename, afterCompileCode, jestResult );
            }
            return jestResult;
        } catch ( error ) {
            console.error( error );
            return src;
        }
    }
};