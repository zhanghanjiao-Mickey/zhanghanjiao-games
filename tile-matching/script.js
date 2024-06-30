var boardElement = document.getElementById('board');
var selectedTile = null; // 存储当前选中的方块元素
var selectedCoords = null; // 存储当前选中的方块坐标
var backendArray = []; // 存储从后端获取的游戏数组

// 使用fetch API调用接口获取数据
fetch('http://172.19.239.233:9090/game/tile-matching/level/1/init', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Token-Player': '1pina/7pCiJKk6OwmbHvBqqpPr7OroSDQxYt0N4HL20q3qC93TV7/Ib94kGcHElM'
    },
}) // TODO: 需要改成关卡
    .then(response => response.json())
    .then(data => {
        backendArray = data.matrix; // 将从后端获取的数据保存到backendArray中
        console.log(backendArray);

        var numRows = backendArray.length;
        var numCols = backendArray[0].length;

        // 根据二维数组动态生成游戏板块
        for (var i = 1; i < numRows - 1; i++) {
            for (var j = 1; j < numCols - 1; j++) {
                var number = backendArray[i][j];
                var tile = document.createElement('div');
                tile.className = 'tile';
                tile.style.backgroundImage = 'url(textures/' + number + '.png)';
                // 添加点击事件监听器
                tile.addEventListener('click', function () {
                    var row = parseInt(this.dataset.row);
                    var col = parseInt(this.dataset.col);
                    var clickedNumber = backendArray[row][col];
                    console.log('Clicked tile at position (' + row + ', ' + col + ')');

                    if (!selectedTile) {
                        // 如果没有选中的方块，则选中当前点击的方块
                        selectedTile = this;
                        selectedCoords = {row: row, col: col};
                        selectedTile.classList.add('selected');
                    } else if (selectedCoords.row === row && selectedCoords.col === col) {
                        // 如果点击的是已经选中的方块，则取消选中状态
                        selectedTile.classList.remove('selected');
                        selectedTile = null;
                        selectedCoords = null;
                    } else {
                        // 如果点击的是另一个方块，则发送请求到后端
                        var requestData = {
                            p1: selectedCoords,
                            p2: {row: row, col: col},
                            matrix: backendArray
                        };

                        fetch('http://172.19.239.233:9090/game/tile-matching/link', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Token-Player': '1pina/7pCiJKk6OwmbHvBqqpPr7OroSDQxYt0N4HL20q3qC93TV7/Ib94kGcHElM'
                            },
                            body: JSON.stringify(requestData)
                        })
                            .then(response => response.json())
                            .then(data => {
                                console.log('Backend response:', data.path);

                                // 如果返回值没有数据，或者当前和上一个选中的小动物不同，则替换当前小动物
                                if (!data.path || data.pathslength === 0 || clickedNumber !== backendArray[selectedCoords.row][selectedCoords.col]) {
                                    // selectedTile.style.backgroundImage = 'url(textures/' + clickedNumber + '.png)';
                                    selectedTile.classList.remove('selected');
                                    selectedTile = this;
                                    selectedCoords = {row: row, col: col};
                                    selectedTile.classList.add('selected');
                                } else {
                                    // 根据后端返回的数据修改对应的方块图片并更新数组
                                    data.path.forEach(coord => {
                                        var tileToChange = document.querySelector('[data-row="' + coord.row + '"][data-col="' + coord.col + '"]');
                                        if (tileToChange) {
                                            tileToChange.style.backgroundImage = 'url(textures/0.png)';
                                            backendArray[coord.row][coord.col] = 0; // 更新数组中的值为0
                                        }
                                    });

                                    // 取消选中状态
                                    selectedTile.classList.remove('selected');
                                    selectedTile = null;
                                    selectedCoords = null;
                                }
                            })
                            .catch(error => {
                                console.error('Error sending tiles to backend:', error);
                            });
                    }
                });
                tile.dataset.row = i;
                tile.dataset.col = j;
                boardElement.appendChild(tile); // 将tile添加到游戏板块中
            }
        }
    })
    .catch(error => {
        console.error('Error fetching game data:', error);
    });
