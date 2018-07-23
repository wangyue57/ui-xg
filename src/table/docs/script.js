angular.module('uixDemo').controller('tableDemoCtrl', ['$scope', '$timeout', function ($scope, $timeout) {
    // your js code here
    $scope.fixHead = true;
    $scope.useSelect = true;
    $scope.single = false;
    $scope.tableLoader = 0;

    $scope.columns = [
        {title: '姓名', key: 'name', fix: true},
        {
            title: '年龄',
            key: 'age',
            filter(val, row) {
                return val * 10;
            }
        },
        {title: '工位', key: 'address'}
    ];

    $scope.operations = [
        {
            showOpt(row) {
                // 根据表格行数据来判断是否显示此按钮
                // eg: 根据单据状态来判断单据是否可编辑
                return row.id % 2;
            },
            clickHandler(row) {
                // 操作按钮事件函数，参数为此行数据
                console.log(row);
                alert(`点击了第${row.id + 1}行！${row.__selected?'此行已选中！':''}`);
            },
            icon: 'fa fa-delete',
            title: '操作'
        }
    ];

    $scope.data = [...Array(100).keys()].map((row, i) => ({
        id: i,
        age: Math.floor(Math.random() * 10),
        name: `编号${9527 + i}`,
        address: `SMG-1-${i + 1}`,
    }));

    $scope.refresh = function () {
        $scope.tableLoader = 1;

        $scope.data = [...Array(100).keys()].map((row, i) => ({
            id: i,
            age: Math.floor(Math.random() * 10),
            name: `编号${9527 + i}`,
            address: `SMG-1-${i + 1}`,
        }));

        $timeout(() => {
            $scope.tableLoader = 0;
        }, 2000)
    }
}]);
