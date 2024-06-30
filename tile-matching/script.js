var boardElement = document.getElementById('board');
var selectedTile = null; // �洢��ǰѡ�еķ���Ԫ��
var selectedCoords = null; // �洢��ǰѡ�еķ�������
var backendArray = []; // �洢�Ӻ�˻�ȡ����Ϸ����

// ʹ��fetch API���ýӿڻ�ȡ����
fetch('http://172.19.239.233:9090/game/tile-matching/level/1/init', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Token-Player': '1pina/7pCiJKk6OwmbHvBqqpPr7OroSDQxYt0N4HL20q3qC93TV7/Ib94kGcHElM'
    },
}) // TODO: ��Ҫ�ĳɹؿ�
    .then(response => response.json())
    .then(data => {
        backendArray = data.matrix; // ���Ӻ�˻�ȡ�����ݱ��浽backendArray��
        console.log(backendArray);

        var numRows = backendArray.length;
        var numCols = backendArray[0].length;

        // ���ݶ�ά���鶯̬������Ϸ���
        for (var i = 1; i < numRows - 1; i++) {
            for (var j = 1; j < numCols - 1; j++) {
                var number = backendArray[i][j];
                var tile = document.createElement('div');
                tile.className = 'tile';
                tile.style.backgroundImage = 'url(textures/' + number + '.png)';
                // ��ӵ���¼�������
                tile.addEventListener('click', function () {
                    var row = parseInt(this.dataset.row);
                    var col = parseInt(this.dataset.col);
                    var clickedNumber = backendArray[row][col];
                    console.log('Clicked tile at position (' + row + ', ' + col + ')');

                    if (!selectedTile) {
                        // ���û��ѡ�еķ��飬��ѡ�е�ǰ����ķ���
                        selectedTile = this;
                        selectedCoords = {row: row, col: col};
                        selectedTile.classList.add('selected');
                    } else if (selectedCoords.row === row && selectedCoords.col === col) {
                        // �����������Ѿ�ѡ�еķ��飬��ȡ��ѡ��״̬
                        selectedTile.classList.remove('selected');
                        selectedTile = null;
                        selectedCoords = null;
                    } else {
                        // ������������һ�����飬�������󵽺��
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

                                // �������ֵû�����ݣ����ߵ�ǰ����һ��ѡ�е�С���ﲻͬ�����滻��ǰС����
                                if (!data.path || data.pathslength === 0 || clickedNumber !== backendArray[selectedCoords.row][selectedCoords.col]) {
                                    // selectedTile.style.backgroundImage = 'url(textures/' + clickedNumber + '.png)';
                                    selectedTile.classList.remove('selected');
                                    selectedTile = this;
                                    selectedCoords = {row: row, col: col};
                                    selectedTile.classList.add('selected');
                                } else {
                                    // ���ݺ�˷��ص������޸Ķ�Ӧ�ķ���ͼƬ����������
                                    data.path.forEach(coord => {
                                        var tileToChange = document.querySelector('[data-row="' + coord.row + '"][data-col="' + coord.col + '"]');
                                        if (tileToChange) {
                                            tileToChange.style.backgroundImage = 'url(textures/0.png)';
                                            backendArray[coord.row][coord.col] = 0; // ���������е�ֵΪ0
                                        }
                                    });

                                    // ȡ��ѡ��״̬
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
                boardElement.appendChild(tile); // ��tile��ӵ���Ϸ�����
            }
        }
    })
    .catch(error => {
        console.error('Error fetching game data:', error);
    });
