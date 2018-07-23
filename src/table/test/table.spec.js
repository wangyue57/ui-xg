describe('ui.xg.table', function () {
    var compile,
        scope;

    beforeEach(function () {
        module('ui.xg.table');
        module('table/templates/table.html');
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