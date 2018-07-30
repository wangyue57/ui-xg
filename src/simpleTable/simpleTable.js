/**
 * simpletable
 * simpletable directive
 * Author: your_email@gmail.com
 * Date:2018-07-27
 */
angular.module('ui.xg.simpletable', [])
    .controller('uixSimpletableCtrl', ['$scope', '$sce', function ($scope, $sce) {
        $scope.$sce = $sce;
        $scope.selectAllRow = function ($event) {
            $scope.$emit('selectAllRow', $event);
        };
        $scope.selectRow = function ($event, clickedRow) {
            $scope.$emit('selectRow', $event, clickedRow);
        };
        $scope.singleSelect = function ($event, clickedRow) {
            $scope.$emit('singleSelect', $event, clickedRow);
        };
        $scope.isRowDisabled = function (row) {
            return row[$scope.enableProp] === false || row[$scope.disableProp] === true;
        }
    }])
    .directive('uixSimpletable', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/simpletable.html',
            replace: true,
            require: ['uixSimpletable'],
            scope: {
                data: '=',
                columns: '=',
                primaryKey: '=',
                fixHead: '=',
                useSelect: '=',
                operations: '=',
                tableLoader: '=',
                widthRadio: '=',
                tableHeight: '=',
                tableWidth: '=',
                parentWidth: '=',
                single: '=?',
                selectedRowMap: '=',
                allRowSelected: '=',
                enableProp: '@?',
                disableProp: '@?',
            },
            controller: 'uixSimpletableCtrl'
        }
    });
