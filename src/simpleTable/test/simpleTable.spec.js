describe('ui.xg.simpleTable', function () {
    var compile,
        scope;

    beforeEach(function () {
        module('ui.xg.simpleTable');
        module('simpleTable/templates/simpleTable.html');
        inject(function( $compile, $rootScope) {
            compile = $compile;
            scope = $rootScope.$new();
        });
    });
    afterEach(function() {

    });

    it('should run without an error',function(){

    });

});
