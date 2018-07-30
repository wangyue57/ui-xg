describe('ui.xg.simpletable', function () {
    var compile,
        scope;

    beforeEach(function () {
        module('ui.xg.simpletable');
        module('simpletable/templates/simpletable.html');
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
