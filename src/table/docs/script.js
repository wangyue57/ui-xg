angular.module('uixDemo').controller('tableDemoCtrl', ['$scope', '$timeout', '$q', function ($scope, $timeout, $q) {

    // 是否固定表头
    $scope.fixHead = false;
    // 表格是否可选择
    $scope.useSelect = false;
    // 表格是否单选，在useSelect为true时，此参数有效
    $scope.single = false;
    // 一个对象，用于记录表格的选中情况， eg:
    // {rowId1: true, rowId2: false} 表示第一行被选中，第二行未选中，rowId1为设置的主键
    $scope.selectedRowMap = {};
    // 一个list，包含所有选中的行数据，翻页后仍保留
    $scope.selectedRows = [];
    // 表格主键，若表格主键不在表格中展示，可在此直接设置（因为性能原因，表格主键必须设置，在此处，或者在columns中
    $scope.primaryKey = 'id';
    // 表头数据
    $scope.columns = [...Array(20).keys()].map(i => ({
        // key为true时，该列的值为表格主键，多个为true时，以最后一个为主键，为false可省略此属性
        key: false,
        // 此列决定了显示表格行数据中的哪个字段
        name: 'col' + i,
        // 显示在表头的title
        title: `第${i + 1}列`,
        // 可自定义添加class到该列的td上
        className: i === 2 ? 'blue' : '',
        // 单元格数据加工函数， 第一个参数为此单元格原始数据，第二个参数为此行完整数据
        formatter(val, row) {
            // 常用于对单元格数据做转换 eg:
            // return val === 1? '真':'假';

            // 也可用于一个单元格展示多个属性的值， eg:
            // return row.a + row.b;

            // 可返回纯文本 或 html标签
            return i === 1 ? `<span style="color: red">${val}<span>` : val;
        }
    }));
    // 表格操作
    $scope.operations = [
        {
            showOpt(row) {
                // 根据表格此行数据来判断是否显示此按钮
                // eg: 根据单据状态来判断单据是否可编辑
                return row.id % 2;
            },
            clickHandler(id, row) {
                // 操作按钮事件函数，第一个参数为该行的主键值，常可设为单据id，第二个参数为此行完整数据
                alert(`点击了第${id}行的删除按钮！${$scope.selectedRowMap[id] ? '此行已选中！' : ''}`);
            },
            icon: 'fa fa-delete',
            title: '删除'
        },
        {
            showOpt(row) {
                return row.id % 3;
            },
            clickHandler(id, row) {
                alert(`点击了第${id}行的添加按钮！${$scope.selectedRowMap[id] ? '此行已选中！' : ''}`);
            },
            icon: 'fa fa-add',
            title: '添加'
        },

    ];
    // 表格数据，实际业务中为后端传来的list
    $scope.data = [...Array(100).keys()].map(i => {
        const val = {id: i + 1};
        angular.forEach($scope.columns, (col, j) => {
            val[col.name] = `第${i + 1}行第${j + 1}列的内容`
        });
        return val;
    });
    // 用户手动选择/取消选择某行的回调
    $scope.onSelect = function (id, selected, allSelected, event) {
        $scope.selectActionText = `此次点击${selected ? '' : '取消'}选中了第${id}行`;

    };
    // 用户全选/取消全选的回调
    $scope.onSelectAll = function (selected, allSelected, event) {
        $scope.selectActionText = `此次点击进行了${selected ? '' : '取消'}全选`;
    };

    $scope.showAllSelected = function () {
        alert($scope.selectedRows.length ? `当前已选中第${$scope.selectedRows.map(row => row.id).join('、')}行` : '当前没有选中行')
    };


    // 刷新表格时，需先设置tableLoader = 1，重新获取数据成功后，设置tableLoader = 0，同uixTableLoader
    $scope.refresh = function () {
        $scope.pageChanged()
    };

    $scope.fixPre = function ($event) {
        $scope.columns[0].fix = $event.target.checked;
        $scope.columns[1].fix = $event.target.checked;
    };

    $scope.fixPost = function ($event) {
        $scope.columns[18].fix = $event.target.checked;
        $scope.columns[19].fix = $event.target.checked;
    };
    $scope.pages = {
        pageNo: 1,
        pageSize: 20,
        totalCount: 100
    };
    $scope.pageChanged = function () {
        // 表格外的pageChange函数，只需要处理数据，然后resolve最后的tableLoader：-1 失败，0成功，2无数据
        return $q(resolve => {
            $timeout(() => resolve(2), 2000)
        })
    }
}]);
