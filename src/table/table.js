/**
 * table
 * table directive
 * Author: your_email@gmail.com
 * Date:2018-07-20
 */
angular.module('ui.xg.table', ['ui.xg.tableLoader'])
    .controller('uixTableCtrl', ['$scope', '$timeout', function ($scope, $timeout) {
        this.init = function () {
            this.initWatch();
            this.setTableSize();
            this.initFixTable();

            if ($scope.useSelect) {
                this.initSelectAble();
            }
        };

        this.initWatch = function () {
            $scope.$watch('data', () => {
                $scope.__allRowSelected = $scope.data.every(row => row.__selected || $scope.isRowDisabled(row));
            });

            $scope.$watch('columns', () => {
                this.initFixTable();
            }, true);
        };

        this.setTableSize = function () {
            const parentWidth = this.el.offsetWidth;
            let totalWidth = $scope.columns.reduce((res, col) => res + (col.width || 150), 0);
            if ($scope.operations) {
                totalWidth += 150;
            }
            if ($scope.useSelect) {
                totalWidth += 50;
            }

            $scope.tableHeight = $scope.height || 450;
            $scope.tableWidth = Math.max(parentWidth, totalWidth);
            $scope.widthRadio = $scope.tableWidth / totalWidth;
            angular.forEach($scope.columns, col => {
                col.width = (col.width || 150) * $scope.widthRadio;
            });
        };

        this.initFixTable = function () {
            let i, j;
            const preFixCols = [];
            const postFixCols = [];
            const colLen = $scope.columns.length;

            for (i = 0; i < colLen; i++) {
                if ($scope.columns[i].fix) {
                    preFixCols.push($scope.columns[i]);
                } else {
                    break;
                }
            }

            for (j = colLen - 1; j > i; j--) {
                if ($scope.columns[j].fix) {
                    postFixCols.unshift($scope.columns[j]);
                } else {
                    break;
                }
            }

            if (preFixCols.length) {
                let preFixWidth = preFixCols.reduce((res, col) => res + col.width, 0);
                if ($scope.useSelect) {
                    preFixWidth += 50 * $scope.widthRadio;
                }

                $scope.preFixCols = preFixCols;
                $scope.preFixWidth = preFixWidth;

                $timeout(() => {
                    const tableContainer = this.el.querySelector('.uix-table-container .uix-table-body-container');
                    const fixTableContainer = this.el.querySelector('.uix-table-pre-frozen .uix-table-body-container');
                    this.syncFixTable(tableContainer, fixTableContainer);
                });
            } else {
                $scope.preFixCols = null;
            }

            if (postFixCols.length) {
                let postFixWidth = postFixCols.reduce((res, col) => res + col.width, 0);
                if ($scope.operations) {
                    postFixWidth += 150 * $scope.widthRadio;
                }

                $scope.postFixCols = postFixCols;
                $scope.postFixWidth = postFixWidth;
                $timeout(() => {
                    const tableContainer = this.el.querySelector('.uix-table-container .uix-table-body-container');
                    const fixTableContainer = this.el.querySelector('.uix-table-post-frozen .uix-table-body-container');
                    this.syncFixTable(tableContainer, fixTableContainer);
                });
            } else {
                $scope.postFixCols = null;
            }
        };

        this.syncFixTable = function (tableContainer, fixTableContainer) {
            let tableTimeStamp = null;
            let fixTableTimeStamp = null;

            angular.element(tableContainer)
                .on('scroll', function (event) {
                    if (event.timeStamp - fixTableTimeStamp < 100) {
                        return;
                    }

                    tableTimeStamp = event.timeStamp;
                    fixTableContainer.scrollTop = tableContainer.scrollTop;
                })
                .triggerHandler('scroll');

            angular.element(fixTableContainer).on('scroll', function (event) {
                if (event.timeStamp - tableTimeStamp < 100) {
                    return;
                }

                fixTableTimeStamp = event.timeStamp;
                tableContainer.scrollTop = fixTableContainer.scrollTop;
            });


            const trs = tableContainer.querySelectorAll('tbody tr');
            const fixTrs = fixTableContainer.querySelectorAll('tbody tr');
            for (let i = 0; i < trs.length; i++) {
            }
        };

        this.initSelectAble = function () {
            $scope.__allRowSelected = false;

            $scope.selectRow = function ($event, rowItem) {
                rowItem.__selected = $event.target.checked;
                $scope.__allRowSelected = $scope.data.every(row => row.__selected || $scope.isRowDisabled(row));
            };

            $scope.selectAllRow = function ($event) {
                $scope.__allRowSelected = $event.target.checked;
                angular.forEach($scope.data, row => row.__selected = $event.target.checked && !$scope.isRowDisabled(row));
            };

            $scope.isRowDisabled = function (row) {
                return row[$scope.enableProp] === false || row[$scope.disableProp] === true;
            }
        };
    }])
    .directive('uixTable', function () {
        return {
            restrict: 'AE',
            templateUrl: 'templates/table.html',
            replace: true,
            require: ['uixTable'],
            scope: {
                data: '=',
                columns: '=',
                tableLoader: '=',
                width: '@?',
                height: '@?',
                operations: '=?',
                fixHead: '=?',
                useSelect: '=?',
                single: '=?',
                enableProp: '@?',
                disableProp: '@?',
            },
            controller: 'uixTableCtrl',
            link: function (scope, el, attrs, ctrls) {
                const tableCtrl = ctrls[0];
                tableCtrl.el = el[0];
                tableCtrl.init();
            }
        }
    });


