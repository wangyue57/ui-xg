angular.module('uixDemo').controller('tableDemoCtrl', ['$scope', '$timeout', function ($scope, $timeout) {
    // your js code here
    $scope.fixHead = true;
    $scope.useSelect = true;
    $scope.single = false;
    $scope.tableLoader = 0;

    $scope.columns = [...Array(20).keys()].map((col, i) => ({
        key: 'col' + i,
        title: `第${i + 1}列`
    }));

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
                alert(`点击了第${row.id + 1}行！${row.__selected ? '此行已选中！' : ''}`);
            },
            icon: 'fa fa-delete',
            title: '操作'
        }
    ];

    $scope.data = [...Array(100).keys()].map((row, i) => {
        const val = {id: i};
        angular.forEach($scope.columns, (col, j) => {
            val[col.key] = `第${i + 1}行第${j + 1}列的内容`
        });
        return val;
    });

    $scope.refresh = function () {
        $scope.tableLoader = 1;
        $timeout(() => $scope.tableLoader = 0, 2000)
    }

    $scope.fixPre = function ($event) {
        $scope.columns[0].fix = $event.target.checked;
        $scope.columns[1].fix = $event.target.checked;
    };

    $scope.fixPost = function ($event) {
        $scope.columns[18].fix = $event.target.checked;
        $scope.columns[19].fix = $event.target.checked;
    };
}]);
