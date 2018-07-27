/**
 * simpleTable
 * simpleTable directive
 * Author: your_email@gmail.com
 * Date:2018-07-27
 */
angular.module('ui.xg.simpleTable', [])
    .controller('uixSimpleTableCtrl', ['$scope', '$sce', function ($scope, $sce) {
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
    .directive('uixSimpleTable', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/simpleTable.html',
            replace: true,
            require: ['uixSimpleTable'],
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
            controller: 'uixSimpleTableCtrl'
        }
    });
