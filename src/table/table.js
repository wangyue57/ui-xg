/**
 * table
 * table directive
 * Author: your_email@gmail.com
 * Date:2018-07-20
 */
angular.module('ui.xg.table', ['ui.xg.simpletable', 'ui.xg.pager'])
    .controller('uixTableCtrl', ['$scope', '$timeout', function ($scope, $timeout) {
        this.init = function () {
            // 缓存多页数据
            $scope.allRowMap = {};

            this.initWatch();
            this.processCols();
            this.setTableSize();
            this.initFixTable();
            this.initSelectAble();
        };

        // columns预处理： 默认宽度，设置主键
        this.processCols = function () {
            angular.forEach($scope.columns, function (col) {
                col.width = col.width || 200;

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

                $scope.allRowSelected = $scope.data.every(function (row) {
                    return $scope.selectedRowMap[row[$scope.primaryKey]] || isRowDisabled(row);
                });

                $timeout(vm.syncFixTableTrHeight.bind(vm));
            });
            $scope.$watch('useSelect', function () {
                vm.setTableSize();
                vm.initFixTable();
            });
            $scope.$watch('selectedRowMap', syncSelectedRow);
            $scope.$watch('fixHead', vm.setTableSize.bind(vm));
            $scope.$watch('columns', vm.initFixTable.bind(vm), true);
        };

        // 设置表格宽高，如果为固定表头，必须要设置高度
        this.setTableSize = function () {
            $scope.parentWidth = this.el.parentNode.scrollWidth;
            var extraWidth = ($scope.operations ? 200 : 0) + ($scope.useSelect ? 50 : 0);
            var totalWidth = getTotalWidth($scope.columns, extraWidth);

            // 当固定表头时，必须设置表格高度
            $scope.tableHeight = $scope.height || 500;
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

            if (preFixCols.length || $scope.fixSelect) {
                var preFixWidth = getTotalWidth(preFixCols, $scope.useSelect ? 50 : 0);
                $scope.preFixCols = preFixCols;
                $scope.preFixWidth = preFixWidth;
            } else {
                $scope.preFixCols = null;
            }

            if (postFixCols.length || $scope.fixOperate) {
                var postFixWidth = getTotalWidth(postFixCols, $scope.operations ? 200 : 0);
                $scope.postFixCols = postFixCols;
                $scope.postFixWidth = postFixWidth;
            } else {
                $scope.postFixCols = null;
            }

            if ($scope.preFixCols || $scope.postFixCols) {
                $timeout(function () {
                    $scope.hasBindScroll || vm.syncFixTableScroll();
                    vm.syncFixTableTrHeight();
                });
            }
        };

        this.syncFixTableScroll = function () {
            $scope.hasBindScroll = true;

            var vm = this;
            var tableTimeStamp = null;
            var preFixTableTimeStamp = null;
            var postFixTableTimeStamp = null;

            var mainContainer = vm.el.querySelector('.uix-table-main');
            var preContainer = vm.el.querySelector('.uix-table-pre-frozen');
            var postContainer = vm.el.querySelector('.uix-table-post-frozen');
            var tableContainer = mainContainer.querySelector('.uix-table-body');
            var preFixTableContainer = preContainer.querySelector('.uix-table-body');
            var postFixTableContainer = postContainer.querySelector('.uix-table-body');

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

            angular.element(tableContainer).on('scroll', function (event) {
                if (event.timeStamp - preFixTableTimeStamp < 100 || event.timeStamp - postFixTableTimeStamp < 100) {
                    return;
                }

                tableTimeStamp = event.timeStamp;
                preFixTableContainer.scrollTop = tableContainer.scrollTop;
                postFixTableContainer.scrollTop = tableContainer.scrollTop;
            }).triggerHandler('scroll');

            angular.element(preFixTableContainer).on('scroll', function (event) {
                if (event.timeStamp - tableTimeStamp < 100 || event.timeStamp - postFixTableTimeStamp < 100) {
                    return;
                }

                preFixTableTimeStamp = event.timeStamp;
                tableContainer.scrollTop = preFixTableContainer.scrollTop;
                postFixTableContainer.scrollTop = preFixTableContainer.scrollTop;
            });

            angular.element(postFixTableContainer).on('scroll', function (event) {
                if (event.timeStamp - tableTimeStamp < 100 || event.timeStamp - preFixTableTimeStamp < 100) {
                    return;
                }

                postFixTableTimeStamp = event.timeStamp;
                tableContainer.scrollTop = postFixTableContainer.scrollTop;
                preFixTableContainer.scrollTop = postFixTableContainer.scrollTop;
            });
        };

        this.syncFixTableTrHeight = function () {
            var trs = this.el.querySelectorAll('.uix-table-main tbody.main tr');
            var preFixTrs = this.el.querySelectorAll('.uix-table-pre-frozen tbody.main tr');
            var postFixTrs = this.el.querySelectorAll('.uix-table-post-frozen tbody.main tr');

            for (var i = 0; i < trs.length; i++) {
                var height = trs[i].offsetHeight + 'px';

                if (preFixTrs[i]) {
                    preFixTrs[i].style.height = height;
                }

                if (postFixTrs[i]) {
                    postFixTrs[i].style.height = height;
                }
            }
        };

        // 使用selectedRowMap设置表格选中逻辑
        this.initSelectAble = function () {
            $scope.allRowSelected = false;
            $scope.selectedRowMap = $scope.selectedRowMap || {};
            syncSelectedRow();

            $scope.$on('selectRow', function (evt, originEvent, clickedRow) {
                $scope.allRowSelected = $scope.data.every(function (row) {
                    return $scope.selectedRowMap[row[$scope.primaryKey]] || isRowDisabled(row);
                });
                syncSelectedRow();

                if ($scope.onSelect) {
                    $scope.onSelect(
                        clickedRow[$scope.primaryKey],
                        originEvent.target.checked,
                        getSelectedRowId(),
                        originEvent
                    );
                }
            });
            $scope.$on('singleSelect', function (evt, originEvent, clickedRow) {
                if ($scope.onSelect) {
                    $scope.onSelect(
                        clickedRow[$scope.primaryKey],
                        true,
                        [clickedRow[$scope.primaryKey]],
                        originEvent
                    );
                }
            });
            $scope.$on('selectAllRow', function (evt, originEvent) {
                $scope.allRowSelected = originEvent.target.checked;
                angular.forEach($scope.data, function (row) {
                    $scope.selectedRowMap[row[$scope.primaryKey]] = originEvent.target.checked && !isRowDisabled(row);
                });
                syncSelectedRow();

                if ($scope.onSelectAll) {
                    $scope.onSelectAll(
                        $scope.allRowSelected,
                        getSelectedRowId(),
                        originEvent
                    );
                }
            });
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

        function getTotalWidth(columns, extra) {
            return columns.reduce(function (res, col) {
                return res + col.width;
            }, extra);
        }
    }])
    .directive('uixTable', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/table.html',
            require: ['uixTable'],
            replace: true,
            scope: {
                data: '=',
                columns: '=',
                height: '@?',
                primaryKey: '=?',
                operations: '=?',
                fixHead: '=?',
                fixSelect: '=?',
                fixOperate: '=?',
                useSelect: '=?',
                single: '=?',
                onSelect: '=?',
                onSelectAll: '=?',
                selectedRowMap: '=?',
                selectedRows: '=?',
                tableLoader: '=?',
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
