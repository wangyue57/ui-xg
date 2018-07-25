/**
 * table
 * table directive
 * Author: your_email@gmail.com
 * Date:2018-07-20
 */
angular.module('ui.xg.table', ['ui.xg.tableLoader'])
    .controller('uixTableCtrl', ['$scope', '$timeout', '$sce', function ($scope, $timeout, $sce) {

        this.init = function () {
            $scope.$sce = $sce;
            this.processCols();
            this.setTableSize();
            this.initFixTable();

            if ($scope.useSelect) {
                this.initSelectAble();
            }

            this.initWatch();
        };

        // columns预处理： 默认宽度，设置主键
        this.processCols = function () {
            angular.forEach($scope.columns, col => {
                col.width = col.width || 150;

                if (col.key) {
                    $scope.primaryKey = col.name;
                }
            });
        };

        this.initWatch = function () {
            $scope.$watch('data', () => {
                if ($scope.useSelect) {
                    $scope.__allRowSelected = $scope.data.every(row => $scope.selectedRowMap[row[$scope.primaryKey]] || $scope.isRowDisabled(row));
                }
            });

            $scope.$watch('columns', () => {
                this.initFixTable();
            }, true);

            $scope.$watch('useSelect', () => {
                this.setTableSize();
            });

            $scope.$watch('fixHead', () => {
                this.setTableSize();
            });
        };

        this.setTableSize = function () {
            const parentWidth = this.el.offsetWidth;
            let totalWidth = $scope.columns.reduce((res, col) => res + col.width, 0);
            if ($scope.operations) {
                totalWidth += 150;
            }
            if ($scope.useSelect) {
                totalWidth += 50;
            }

            // 当固定表头时，必须设置表格高度
            $scope.tableHeight = $scope.height || ($scope.fixHead ? 450 : NaN);
            // 当表格宽度小于父盒子宽度时，放大到表格宽度父盒子宽度
            $scope.tableWidth = Math.max(parentWidth, totalWidth);
            $scope.widthRadio = $scope.tableWidth / totalWidth;
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
                    preFixWidth += 50;
                }

                $scope.preFixCols = preFixCols;
                $scope.preFixWidth = preFixWidth;

                $timeout(() => {
                    const tableContainer = this.el.querySelector('.uix-table-main .uix-table-body-container');
                    const fixTableContainer = this.el.querySelector('.uix-table-pre-frozen .uix-table-body-container');
                    this.syncFixTable(tableContainer, fixTableContainer);
                });
            } else {
                $scope.preFixCols = null;
            }

            if (postFixCols.length) {
                let postFixWidth = postFixCols.reduce((res, col) => res + col.width, 0);
                if ($scope.operations) {
                    postFixWidth += 150;
                }

                $scope.postFixCols = postFixCols;
                $scope.postFixWidth = postFixWidth;
                $timeout(() => {
                    const tableContainer = this.el.querySelector('.uix-table-main .uix-table-body-container');
                    const fixTableContainer = this.el.querySelector('.uix-table-post-frozen .uix-table-body-container');
                    this.syncFixTable(tableContainer, fixTableContainer);
                });
            } else {
                $scope.postFixCols = null;
            }

            if (preFixCols.length || postFixCols.length) {
                const mainContainer = this.el.querySelector('.uix-table-main');
                const preContainer = this.el.querySelector('.uix-table-pre-frozen');
                const postContainer = this.el.querySelector('.uix-table-post-frozen');

                angular.element(mainContainer).on('scroll', function () {
                    if (mainContainer.scrollLeft > 0) {
                        preContainer.classList.add('show-shadow');
                    } else {
                        preContainer.classList.remove('show-shadow');
                    }

                    if (mainContainer.scrollLeft < $scope.tableWidth - mainContainer.offsetWidth) {
                        postContainer.classList.add('show-shadow');
                    } else {
                        postContainer.classList.remove('show-shadow');
                    }
                }).triggerHandler('scroll');
            }
        };

        // 冻结表格与主表格同步滚动 &  冻结表格与主表格tr设置为相同高度
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
                fixTrs[i].style.height = trs[i].offsetHeight + 'px';
            }
        };

        // 使用selectedRowMap设置表格选中逻辑
        this.initSelectAble = function () {
            $scope.__allRowSelected = false;
            $scope.selectedRowMap = $scope.selectedRowMap || {};

            $scope.selectRow = function ($event, clickedRow) {
                $scope.__allRowSelected = $scope.data.every(row => $scope.selectedRowMap[row[$scope.primaryKey]] || $scope.isRowDisabled(row));

                if ($scope.onSelect) {
                    $scope.onSelect(
                        clickedRow[$scope.primaryKey],
                        $event.target.checked,
                        Object.keys($scope.selectedRowMap).filter(rowKey => $scope.selectedRowMap[rowKey]),
                        $event
                    );
                }
            };
            $scope.singleSelect = function ($event, clickedRow) {
                if ($scope.onSelect) {
                    $scope.onSelect(
                        clickedRow[$scope.primaryKey],
                        true,
                        [clickedRow[$scope.primaryKey]],
                        $event
                    );
                }
            };

            $scope.selectAllRow = function ($event) {
                $scope.__allRowSelected = $event.target.checked;
                angular.forEach($scope.data, row => {
                    $scope.selectedRowMap[row[$scope.primaryKey]] = $event.target.checked && !$scope.isRowDisabled(row)
                });

                if ($scope.onSelectAll) {
                    $scope.onSelectAll(
                        $scope.__allRowSelected,
                        Object.keys($scope.selectedRowMap).filter(rowKey => $scope.selectedRowMap[rowKey]),
                        $event
                    );
                }
            };

            $scope.isRowDisabled = function (row) {
                return row[$scope.enableProp] === false || row[$scope.disableProp] === true;
            }
        };
    }])
    .directive('uixTable', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/table.html',
            require: ['uixTable'],
            scope: {
                data: '=',
                columns: '=',
                tableLoader: '=',
                height: '@?',
                primaryKey: '=?',
                operations: '=?',
                fixHead: '=?',
                useSelect: '=?',
                single: '=?',
                onSelect: '=?',
                onSelectAll: '=?',
                selectedRowMap: '=?',
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


