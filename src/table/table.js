/**
 * table
 * table directive
 * Author: your_email@gmail.com
 * Date:2018-07-20
 */
angular.module('ui.xg.table', ['ui.xg.pager'])
    .controller('uixTableCtrl', ['$sce', '$scope', '$timeout', function ($sce, $scope, $timeout) {
        this.init = function () {
            $scope.$sce = $sce;
            $scope.selectRow = selectRow;
            $scope.selectAllRow = selectAllRow;
            $scope.singleSelect = singleSelect;
            $scope.isRowDisabled = isRowDisabled;
            $scope.selectedRowMap = $scope.selectedRowMap || {};

            processCols();
            syncAllRowMap();
            syncSelectedRow();
            syncAllRowSelected();

            this.initWatch();
            this.setTableSize();
            this.initFixTable();
        };

        // 响应数据变化，
        // 列表数据刷新后，增加数据缓存和重新判断全选状态
        // 外部更改selectedRowMap 同步selectedRow
        this.initWatch = function () {
            $scope.$watch('data', () => {
                syncAllRowMap();
                syncSelectedRow();
                syncAllRowSelected();
                $scope.$evalAsync(this.syncFixTableTrHeight.bind(this));
            });

            $scope.$watch('selectedRowMap', syncSelectedRow);
        };

        // 设置表格宽高，如果为固定表头，必须要设置高度
        this.setTableSize = function () {
            $scope.parentWidth = this.el.parentNode.scrollWidth;
            const extraWidth = ($scope.operations ? 200 : 0) + ($scope.selectable ? 50 : 0);
            const totalWidth = getTotalWidth($scope.columns, extraWidth);

            // 当固定表头时，必须设置表格高度
            $scope.tableHeight = $scope.height || 500;
            // 当表格宽度小于父盒子宽度时，放大到表格宽度父盒子宽度
            $scope.tableWidth = Math.max($scope.parentWidth, totalWidth);
            $scope.widthRadio = $scope.tableWidth / totalWidth;
        };

        // 初始化冻结列： 找出是否有冻结列 & 如果有冻结列初始化横向滚动是的冻结表格阴影
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

            if (preFixCols.length || $scope.fixSelect) {
                $scope.preFixCols = preFixCols;
                $scope.preFixWidth = getTotalWidth(preFixCols, $scope.selectable ? 50 : 0);
            }

            if (postFixCols.length || $scope.fixOperate) {
                $scope.postFixCols = postFixCols;
                $scope.postFixWidth = getTotalWidth(postFixCols, $scope.operations ? 200 : 0);
            }

            if ($scope.preFixCols || $scope.postFixCols) {
                $timeout(this.syncFixTableScroll.bind(this));
            }
        };

        // 如果有冻结列，设置冻结表格滚动同步
        this.syncFixTableScroll = function () {
            let tableTimeStamp = null;
            let preFixTableTimeStamp = null;
            let postFixTableTimeStamp = null;

            const mainContainer = this.el.querySelector('.uix-table-main');
            const preContainer = this.el.querySelector('.uix-table-pre-frozen');
            const postContainer = this.el.querySelector('.uix-table-post-frozen');
            const tableContainer = mainContainer.querySelector('.uix-table-body');
            const preFixTableContainer = preContainer.querySelector('.uix-table-body');
            const postFixTableContainer = postContainer.querySelector('.uix-table-body');

            // 主表格左右滑动时， 给固定表格加阴影
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

            // 表格上下滑动同步
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

        // 如果有冻结列，设置冻结表格行高与主表格一致
        this.syncFixTableTrHeight = function () {
            const trs = this.el.querySelectorAll('.uix-table-main tbody.main tr');
            const preFixTrs = this.el.querySelectorAll('.uix-table-pre-frozen tbody.main tr');
            const postFixTrs = this.el.querySelectorAll('.uix-table-post-frozen tbody.main tr');

            for (let i = 0; i < trs.length; i++) {
                const height = trs[i].offsetHeight + 'px';
                console.log(height);
                if (preFixTrs[i]) {
                    preFixTrs[i].style.height = height;
                }

                if (postFixTrs[i]) {
                    postFixTrs[i].style.height = height;
                }
            }
        };

        // columns预处理： 默认宽度，默认formatter，设置主键
        function processCols() {
            for (let i = 0, len = $scope.columns.length; i < len; i++) {
                const col = $scope.columns[i];
                col.width = col.width || 200;
                col.formatter = col.formatter || pipe;

                if (col.key) {
                    $scope.primaryKey = col.name;
                }
            }
        }

        // 点击行选择，同步全选按钮及选中行，触发钩子
        function selectRow($event, row) {
            syncSelectedRow();
            syncAllRowSelected();

            if ($scope.onSelect) {
                $timeout(() => {
                    $scope.onSelect(row, row[$scope.primaryKey], $event.target.checked);
                });
            }
        }

        // 点击全部选择，触发钩子
        function selectAllRow($event) {
            $scope.allRowSelected = $event.target.checked;
            $scope.data.forEach(row => {
                $scope.selectedRowMap[row[$scope.primaryKey]] = $event.target.checked && !isRowDisabled(row);
            });
            syncSelectedRow();

            if ($scope.onSelectAll) {
                $timeout(() => {
                    $scope.onSelectAll($scope.allRowSelected);
                });
            }
        }

        // 点击行单选，触发钩子
        function singleSelect($event, row) {
            if ($scope.onSelect) {
                $timeout(() => {
                    $scope.onSelect(row, row[$scope.primaryKey], true);
                });
            }
        }

        // 判断行是否可选
        function isRowDisabled(row) {
            return row[$scope.enableProp] === false || row[$scope.disableProp] === true;
        }

        // data变化时，同步allRowMap
        function syncAllRowMap() {
            if (!$scope.recordMultiPage || !$scope.allRowMap) {
                $scope.allRowMap = {};
            }
            $scope.data.forEach(row => $scope.allRowMap[row[$scope.primaryKey]] = row);
        }

        // 行选择情况发生变化时，同步是否全选值
        function syncAllRowSelected() {
            $scope.allRowSelected = $scope.data.every(row => {
                return $scope.selectedRowMap[row[$scope.primaryKey]] || isRowDisabled(row);
            });
        }

        // 行选择情况发生变化时，同步所有选中行数组
        function syncSelectedRow() {
            $scope.selectedRows = Object.entries($scope.selectedRowMap).reduce((res, [key, selected]) => {
                if (selected && ($scope.recordMultiPage || $scope.allRowMap.hasOwnProperty(key))) {
                    res.push($scope.allRowMap[key])
                }
                return res;
            }, []);
        }

        // 获取表格总宽度
        function getTotalWidth(columns, extra) {
            return columns.reduce((res, col) => res + col.width, extra);
        }

        function pipe(val) {
            return val;
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
                selectable: '=?',
                single: '=?',
                onSelect: '=?',
                onSelectAll: '=?',
                selectedRowMap: '=?',
                selectedRows: '=?',
                tableLoader: '=?',
                enableProp: '@?',
                disableProp: '@?',
                pages: '=?',
                pageChanged: '=?',
                recordMultiPage: '=?'
            },
            controller: 'uixTableCtrl',
            link: function (scope, el, attrs, ctrls) {
                const tableCtrl = ctrls[0];
                tableCtrl.el = el[0];
                tableCtrl.init();
            }
        };
    });
