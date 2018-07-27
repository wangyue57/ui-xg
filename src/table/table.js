/**
 * table
 * table directive
 * Author: your_email@gmail.com
 * Date:2018-07-20
 */
angular.module('ui.xg.table', ['ui.xg.pager'])
    .controller('uixTableCtrl', ['$scope', '$timeout', '$sce', function ($scope, $timeout, $sce) {
        this.init = function () {
            // 安全相关，ng-bind-html需要
            $scope.$sce = $sce;
            // 缓存多页数据
            $scope.allRowMap = {};
            // loader相关
            $scope.tableLoader = 0;

            this.initWatch();
            this.processCols();
            this.setTableSize();
            this.initFixTable();
            this.initSelectAble();
            this.initPageChangeHandler();
        };

        // columns预处理： 默认宽度，设置主键
        this.processCols = function () {
            angular.forEach($scope.columns, function (col) {
                col.width = col.width || 150;

                if (col.key) {
                    $scope.primaryKey = col.name;
                }
            });
        };

        // 响应数据变化，一般是列表数据刷新后，增加数据缓存和重新判断全选状态
        this.initWatch = function () {
            var vm = this;
            $scope.$watch('data', function (data) {
                angular.forEach(data, function (row) {
                    $scope.allRowMap[row[$scope.primaryKey]] = row;
                });

                $scope.__allRowSelected = $scope.data.every(function (row) {
                    return $scope.selectedRowMap[row[$scope.primaryKey]] || isRowDisabled(row);
                });
            });
            $scope.$watch('fixHead', vm.setTableSize.bind(vm));
            $scope.$watch('columns', vm.initFixTable.bind(vm), true);
            $scope.$watch('useSelect', function () {
                vm.setTableSize();
                vm.initFixTable();
            });
        };

        // 设置表格宽高，如果为固定表头，必须要设置高度
        this.setTableSize = function () {
            $scope.parentWidth = this.el.parentNode.offsetWidth;
            var totalWidth = getTotalWidth($scope.columns);
            if ($scope.operations) {
                totalWidth += 150;
            }
            if ($scope.useSelect) {
                totalWidth += 50;
            }

            // 当固定表头时，必须设置表格高度
            $scope.tableHeight = $scope.height || 450;
            // 当表格宽度小于父盒子宽度时，放大到表格宽度父盒子宽度
            $scope.tableWidth = Math.max($scope.parentWidth, totalWidth);
            $scope.widthRadio = $scope.tableWidth / totalWidth;
        };

        // 初始化冻结列： 找出是否有冻结列 & 如果有冻结列初始化横向滚动是的冻结表格阴影
        this.initFixTable = function () {
            var i, j;
            var vm = this;
            var preFixCols = [];
            var postFixCols = [];
            var colLen = $scope.columns.length;

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
                var preFixWidth = getTotalWidth(preFixCols);
                if ($scope.useSelect) {
                    preFixWidth += 50;
                }

                $scope.preFixCols = preFixCols;
                $scope.preFixWidth = preFixWidth;

                $timeout(function () {
                    var tableContainer = vm.el.querySelector('.uix-table-main .uix-table-body-container');
                    var fixTableContainer = vm.el.querySelector('.uix-table-pre-frozen .uix-table-body-container');
                    vm.syncFixTable(tableContainer, fixTableContainer);
                });
            } else {
                $scope.preFixCols = null;
            }

            if (postFixCols.length) {
                var postFixWidth = getTotalWidth(postFixCols);
                if ($scope.operations) {
                    postFixWidth += 150;
                }

                $scope.postFixCols = postFixCols;
                $scope.postFixWidth = postFixWidth;

                $timeout(function () {
                    var tableContainer = vm.el.querySelector('.uix-table-main .uix-table-body-container');
                    var fixTableContainer = vm.el.querySelector('.uix-table-post-frozen .uix-table-body-container');
                    vm.syncFixTable(tableContainer, fixTableContainer);
                });
            } else {
                $scope.postFixCols = null;
            }

            if (preFixCols.length || postFixCols.length) {
                var mainContainer = vm.el.querySelector('.uix-table-main');
                var preContainer = vm.el.querySelector('.uix-table-pre-frozen');
                var postContainer = vm.el.querySelector('.uix-table-post-frozen');

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
            var tableTimeStamp = null;
            var fixTableTimeStamp = null;

            angular.element(tableContainer).on('scroll', function (event) {
                if (event.timeStamp - fixTableTimeStamp < 100) {
                    return;
                }

                tableTimeStamp = event.timeStamp;
                fixTableContainer.scrollTop = tableContainer.scrollTop;
            }).triggerHandler('scroll');

            angular.element(fixTableContainer).on('scroll', function (event) {
                if (event.timeStamp - tableTimeStamp < 100) {
                    return;
                }

                fixTableTimeStamp = event.timeStamp;
                tableContainer.scrollTop = fixTableContainer.scrollTop;
            });

            var trs = tableContainer.querySelectorAll('tbody.main tr');
            var fixTrs = fixTableContainer.querySelectorAll('tbody tr');
            for (var i = 0; i < trs.length; i++) {
                fixTrs[i].style.height = trs[i].offsetHeight + 'px';
            }
        };

        // 使用selectedRowMap设置表格选中逻辑
        this.initSelectAble = function () {
            $scope.__allRowSelected = false;
            $scope.selectedRowMap = $scope.selectedRowMap || {};
            syncSelectedRow();

            $scope.selectRow = function ($event, clickedRow) {
                $scope.__allRowSelected = $scope.data.every(function (row) {
                    return $scope.selectedRowMap[row[$scope.primaryKey]] || isRowDisabled(row);
                });
                syncSelectedRow();

                if ($scope.onSelect) {
                    $scope.onSelect(
                        clickedRow[$scope.primaryKey],
                        $event.target.checked,
                        getSelectedRowId(),
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
                angular.forEach($scope.data, function (row) {
                    $scope.selectedRowMap[row[$scope.primaryKey]] = $event.target.checked && !isRowDisabled(row);
                });
                syncSelectedRow();

                if ($scope.onSelectAll) {
                    $scope.onSelectAll(
                        $scope.__allRowSelected,
                        getSelectedRowId(),
                        $event
                    );
                }
            };
        };

        // wrap传入的pageChanged函数，封装tableLoader及防重
        this.initPageChangeHandler = function () {
            $scope.pageChangeHandler = function () {
                if ($scope.tableLoader === 1) {
                    return;
                }

                $scope.tableLoader = 1;
                $scope.pageChanged().then(function (tableLoader) {
                    $scope.tableLoader = tableLoader;
                }, function () {
                    $scope.tableLoader = -1;
                });
            };
        };

        function isRowDisabled(row) {
            return row[$scope.enableProp] === false || row[$scope.disableProp] === true;
        }

        function syncSelectedRow() {
            $scope.selectedRows = Object.entries($scope.selectedRowMap).reduce(function (res, entry) {
                if (entry[1]) {
                    res.push($scope.allRowMap[entry[0]]);
                }
                return res;
            }, []);
        }

        function getSelectedRowId() {
            return Object.keys($scope.selectedRowMap).filter(function (rowKey) {
                return $scope.selectedRowMap[rowKey];
            });
        }

        function getTotalWidth(columns) {
            return columns.reduce(function (res, col) {
                return res + col.width;
            }, 0);
        }
    }])
    .directive('uixTable', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/table.html',
            require: ['uixTable'],
            scope: {
                data: '=',
                columns: '=',
                height: '@?',
                primaryKey: '=?',
                operations: '=?',
                fixHead: '=?',
                useSelect: '=?',
                single: '=?',
                onSelect: '=?',
                onSelectAll: '=?',
                selectedRowMap: '=?',
                selectedRows: '=?',
                enableProp: '@?',
                disableProp: '@?',
                pages: '=?',
                pageChanged: '=?'
            },
            controller: 'uixTableCtrl',
            link: function (scope, el, attrs, ctrls) {
                var tableCtrl = ctrls[0];
                tableCtrl.el = el[0];
                tableCtrl.init();
            }
        };
    });
