class InteractiveMap {
    constructor() {
        this.objects = [];
        this.characters = [];
        this.selectedObject = null;
        this.clickHistory = [];
        this.maxHistoryItems = 10;
        this.isFilterActive = false;
        this.mapWidth = 0;
        this.mapHeight = 0;
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.renderLists();
        this.waitForImageLoad();
    }

    waitForImageLoad() {
        const mapImage = document.getElementById('map-image');
        if (mapImage.complete) {
            this.onImageLoad();
        } else {
            mapImage.addEventListener('load', () => this.onImageLoad());
        }
    }

    onImageLoad() {
        const mapImage = document.getElementById('map-image');
        this.mapWidth = mapImage.naturalWidth;
        this.mapHeight = mapImage.naturalHeight;

        this.createMapAreas();
        this.renderObjectMarkers();
    }

    loadData() {
        // Пример данных с абсолютными координатами относительно исходного размера изображения
        this.objects = [
            {
                id: 1,
                name: "Таверна Пьяный Единорог",
                type: "location",
                coords: [851, 460, 861, 470], // Абсолютные координаты для областей
                description: "Ночлег (общий зал - 5 медяков, комната - 2 зм), ужин (5 медяков), информация (1 зм, ненадёжно)",
                center: [856, 465] // Абсолютные координаты центра
            },
            {
                id: 2,
                name: "Оружейня «Сталь и Верность»",
                type: "location",
                coords: [412, 226, 432, 246],
                description: "Обычное оружие/доспехи, ремонт (10-50 зм), +1 оружие (500 зм, под заказ).",
                center: [422, 236]
            },
            {
                id: 3,
                name: "Аптека «Корни и Сны»",
                type: "location",
                coords: [469, 270, 489, 290],
                description: "Зелья лечения (50 зм), антидоты (50 зм), редкие травы (цена договорная)",
                center: [479, 280]
            }
            ,
            {
                id: 4,
                name: "Гостиница «Позолоченный Единорог»",
                type: "location",
                coords: [1135, 206, 1155, 226],
                description: "Ночлег (люкс - 10 зм), ужин (5 зм), хранение ценностей (2 зм/день)",
                center: [1145, 216]
            }
            ,
            {
                id: 5,
                name: "Собор Золотого Молота (Этериус)",
                type: "location",
                coords: [682, 289, 702, 309],
                description: "Грандиозное сооружение в самом центре города, на главной площади. Белоснежный мрамор, золотые купола, высокие шпили, устремлённые в небо. Внутри — просторные залы, где одновременно могут молиться сотни людей. Статуи Этериуса грозно взирают на прихожан. \nУслуги: - Благословение: +1 к броскам атаки на 24 часа за пожертвование (25 зм).\n- Снятие Проклятия/Изгнание нечисти: Очень дорого (100+ зм), требует доказательств необходимости.",
                center: [692, 299]
            }
            ,
            {
                id: 6,
                name: "Роща Тихих Шёпотов (Сильвана)",
                type: "location",
                coords: [1172, 307, 1192, 327],
                description: "Не храм, а огромный, ухоженный сад в богатом квартале, окружённый высокой стеной. Здесь растут древние дубы, серебряные берёзы и целебные травы. В центре — поляна для ритуалов под открытым небом. Воздух чист и наполнен ароматом хвои и цветов.",
                center: [1182, 317]
            }
            ,
            {
                id: 7,
                name: "Гавань Вечного Прилива (Морван)",
                type: "location",
                coords: [255, 480, 275, 500],
                description: "Храм-порт на набережной Солнцеграда. Построен на сваях, частично уходящих в воду. К нему ведут длинные мостки, где раскачиваются на волнах лодки-часовни. Внутри пахнет солёной водой, смолой и ладаном. Слышен звон колоколов, предупреждающих о шторме.",
                center: [265, 490]
            }
            ,
            {
                id: 8,
                name: "Цитадель Алого Рассвета",
                type: "location",
                coords: [1703, 368, 1703, 368],
                description: "Охота на еретиков, ведьм и культистов. Расширение влияния церкви на светскую власть.",
                center: [703, 368]
            },
            {
                id: 9,
                name: "посольство Хаймрока",
                type: "location",
                coords: [535, 110, 555, 130],
                description: "Отстаивает интересы Хаймрока при дворе Люциана, ищет выгодные контракты на поставку оружия и металла",
                center: [545, 120]
            },
            {
                id: 10,
                name: "Площадь Ясного Неба",
                type: "location",
                coords: [952, 361,952, 361],
                description: "",
                center: [952, 361]
            }
        ];

        this.characters = [
            {
                id: 1,
                name: "Старый Маг Тельбран",
                type: "character",
                locationId: 5,
                description: "Бывший архивариус Гильдии Арканов, отстранённый за исследования запретных текстов о Бездне. Теперь живёт как отшельник-книгочей"
            },
            {
                id: 2,
                name: "Верховный Инквизитор Каррик",
                type: "character",
                locationId: 8,
                description: "Глава Ордена Алого Рассвета, фанатичный и беспринципный служитель Этериуса"
            },
            {
                id: 3,
                name: "Ярл Ульфрик Скай-Айс",
                type: "character",
                locationId: 9,
                description: "Военный лидер (херсир) клана Снежного Медведя, представитель Хаймрока в Солнцеграде"
            },{
                id: 4,
                name: "Сторож на Площади Ясного Неба",
                type: "character",
                locationId: 10,
                description: "Проведёт героев через опасные зоны за плату. Также может дать информацию о безопасных маршрутах."
            },
        ];
    }

    renderObjectMarkers() {
        if (this.mapWidth === 0 || this.mapHeight === 0) return;

        const overlay = document.getElementById('map-overlay');

        // Очищаем старые маркеры
        const oldMarkers = overlay.querySelectorAll('.object-marker, .object-label');
        oldMarkers.forEach(marker => marker.remove());

        // Если фильтр активен - не показываем маркеры
        if (this.isFilterActive) {
            overlay.classList.remove('objects-visible');
            overlay.classList.add('filter-active');
            return;
        }

        // Показываем маркеры объектов
        overlay.classList.add('objects-visible');
        overlay.classList.remove('filter-active');

        this.objects.forEach(obj => {
            if (obj.center) {
                // Конвертируем абсолютные координаты в проценты для отображения
                const percentX = (obj.center[0] / this.mapWidth) * 100;
                const percentY = (obj.center[1] / this.mapHeight) * 100;

                // Создаем маркер
                const marker = document.createElement('div');
                marker.className = 'object-marker';
                marker.style.left = `${percentX}%`;
                marker.style.top = `${percentY}%`;
                marker.dataset.id = obj.id;

                // Создаем подпись
                const label = document.createElement('div');
                label.className = 'object-label';
                label.textContent = obj.name;
                label.style.left = `${percentX}%`;
                label.style.top = `${percentY}%`;

                // Добавляем на карту
                overlay.appendChild(marker);
                overlay.appendChild(label);
            }
        });
    }

    createMapAreas() {
        if (this.mapWidth === 0 || this.mapHeight === 0) return;

        const mapElement = document.getElementById('objectMap');
        mapElement.innerHTML = '';

        this.objects.forEach(obj => {
            const area = document.createElement('area');
            area.shape = 'rect';

            // Конвертируем абсолютные координаты в проценты для тега <area>
            const coordsPercent = [
                (obj.coords[0] / this.mapWidth) * 100,
                (obj.coords[1] / this.mapHeight) * 100,
                (obj.coords[2] / this.mapWidth) * 100,
                (obj.coords[3] / this.mapHeight) * 100
            ];

            area.coords = coordsPercent.join(',');
            area.title = obj.name;
            area.dataset.id = obj.id;

            area.addEventListener('mouseenter', () => this.highlightArea(obj.id));
            area.addEventListener('mouseleave', () => this.removeHighlight());
            area.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showObjectDetails(obj);
            });

            mapElement.appendChild(area);
        });
    }

    setupEventListeners() {
        const mapWrapper = document.querySelector('.map-wrapper');

        // Отслеживание движения курсора
        mapWrapper.addEventListener('mousemove', (e) => {
            this.updateCursorCoordinates(e);
        });

        // Клик по карте
        mapWrapper.addEventListener('click', (e) => {
            this.handleMapClick(e);
        });

        // Правый клик для координат
        mapWrapper.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.handleRightClick(e);
        });

        // Поиск
        const searchInput = document.getElementById('search');
        searchInput.addEventListener('input', (e) => {
            this.handleFilterChange(e.target.value);
        });

        // Фильтр по типу
        const filterType = document.getElementById('filter-type');
        filterType.addEventListener('change', (e) => {
            this.handleFilterChange(searchInput.value, e.target.value);
        });

        // Закрытие попапа
        document.querySelector('.close').addEventListener('click', () => {
            this.hidePopup();
        });

        // Клик вне попапа
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('popup')) {
                this.hidePopup();
            }
        });

        // Ресайз окна - пересчитываем позиции
        window.addEventListener('resize', () => {
            this.renderObjectMarkers();
        });
    }

    getAbsoluteCoordinates(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Конвертируем экранные координаты в абсолютные координаты исходного изображения
        const absoluteX = Math.round((x / rect.width) * this.mapWidth);
        const absoluteY = Math.round((y / rect.height) * this.mapHeight);

        return {
            screen: { x: Math.round(x), y: Math.round(y) },
            absolute: { x: absoluteX, y: absoluteY }
        };
    }

    updateCursorCoordinates(e) {
        if (this.mapWidth === 0 || this.mapHeight === 0) return;

        const coords = this.getAbsoluteCoordinates(e);
        document.getElementById('cursor-coords').textContent = `X: ${coords.absolute.x}, Y: ${coords.absolute.y}`;
    }

    handleMapClick(e) {
        if (this.mapWidth === 0 || this.mapHeight === 0) return;

        const coords = this.getAbsoluteCoordinates(e);
        this.showClickMarker(coords.screen.x, coords.screen.y);
        this.addToClickHistory(coords.absolute.x, coords.absolute.y, 'Левый клик');

        console.log(`Абсолютные координаты клика: X: ${coords.absolute.x}, Y: ${coords.absolute.y}`);
        console.log('Эти координаты можно использовать при инициализации объектов:');
        console.log(`coords: [${coords.absolute.x}, ${coords.absolute.y}, ${coords.absolute.x + 100}, ${coords.absolute.y + 100}]`);
        console.log(`center: [${coords.absolute.x + 50}, ${coords.absolute.y + 50}]`);
    }

    handleRightClick(e) {
        e.preventDefault();
        if (this.mapWidth === 0 || this.mapHeight === 0) return;

        const coords = this.getAbsoluteCoordinates(e);
        this.showClickMarker(coords.screen.x, coords.screen.y);
        this.addToClickHistory(coords.absolute.x, coords.absolute.y, 'Правый клик');

        console.log(`Абсолютные координаты правого клика: X: ${coords.absolute.x}, Y: ${coords.absolute.y}`);
    }

    showClickMarker(x, y) {
        const marker = document.getElementById('click-marker');
        marker.style.left = `${x}px`;
        marker.style.top = `${y}px`;
        marker.style.display = 'block';

        // Скрываем маркер через 2 секунды
        setTimeout(() => {
            marker.style.display = 'none';
        }, 2000);
    }

    addToClickHistory(x, y, type) {
        const clickData = {
            x,
            y,
            type,
            timestamp: new Date().toLocaleTimeString(),
            mapSize: `${this.mapWidth}x${this.mapHeight}`
        };

        this.clickHistory.unshift(clickData);

        // Ограничиваем историю
        if (this.clickHistory.length > this.maxHistoryItems) {
            this.clickHistory.pop();
        }

        this.renderClickHistory();
    }

    renderClickHistory() {
        const historyContainer = document.getElementById('click-history');
        historyContainer.innerHTML = '';

        if (this.mapWidth === 0 || this.mapHeight === 0) {
            historyContainer.innerHTML = '<div class="click-item">Загрузка карты...</div>';
            return;
        }

        historyContainer.innerHTML = `<div class="click-item" style="background: #e9ecef; font-weight: bold;">
            Размер карты: ${this.mapWidth}×${this.mapHeight} px
        </div>`;

        this.clickHistory.forEach((click, index) => {
            const item = document.createElement('div');
            item.className = 'click-item';
            item.innerHTML = `
                <strong>${click.timestamp}</strong><br>
                ${click.type}: X: ${click.x}, Y: ${click.y}<br>
                <small>Для использования: [${click.x}, ${click.y}]</small>
            `;

            item.addEventListener('click', () => {
                // Показываем маркер на экране
                const rect = document.querySelector('.map-wrapper').getBoundingClientRect();
                const screenX = (click.x / this.mapWidth) * rect.width;
                const screenY = (click.y / this.mapHeight) * rect.height;
                this.showClickMarker(screenX, screenY);

                // Выводим в консоль для удобства копирования
                console.log(`Координаты для объекта:`);
                console.log(`coords: [${click.x - 50}, ${click.y - 50}, ${click.x + 50}, ${click.y + 50}]`);
                console.log(`center: [${click.x}, ${click.y}]`);
            });

            historyContainer.appendChild(item);
        });
    }

    handleFilterChange(searchTerm, filterType = null) {
        if (!filterType) {
            filterType = document.getElementById('filter-type').value;
        }

        // Проверяем, активен ли фильтр
        const hasSearch = searchTerm.trim().length > 0;
        const hasTypeFilter = filterType !== 'all';
        this.isFilterActive = hasSearch || hasTypeFilter;

        // Обновляем отображение маркеров
        this.renderObjectMarkers();

        // Фильтруем списки
        this.filterItems(searchTerm, filterType);
    }

    renderLists() {
        this.renderObjectsList();
        this.renderCharactersList();
    }

    renderObjectsList() {
        const container = document.getElementById('objects-container');
        container.innerHTML = '';

        this.objects.forEach(obj => {
            const li = document.createElement('li');
            li.textContent = obj.name;
            li.dataset.id = obj.id;
            li.addEventListener('click', () => this.showObjectDetails(obj));
            container.appendChild(li);
        });
    }

    renderCharactersList() {
        const container = document.getElementById('characters-container');
        container.innerHTML = '';

        this.characters.forEach(char => {
            const li = document.createElement('li');
            li.textContent = char.name;
            li.dataset.id = char.id;
            li.addEventListener('click', () => this.showCharacterDetails(char));
            container.appendChild(li);
        });
    }

    showObjectDetails(object) {
        this.selectedObject = object;

        const popup = document.getElementById('popup');
        document.getElementById('popup-title').innerText = object.name;
        document.getElementById('popup-description').innerText = object.description;

        popup.style.display = 'block';
        this.highlightArea(object.id);
    }

    showCharacterDetails(character) {
        const location = this.objects.find(obj => obj.id === character.locationId);

        const popup = document.getElementById('popup');
        document.getElementById('popup-title').innerText = character.name;
        document.getElementById('popup-description').innerText =
            `${character.description}\n\nНаходится в: ${location ? location.name : 'Неизвестно'}`;

        popup.style.display = 'block';

        if (location) {
            this.highlightArea(location.id);
        }
    }

    highlightArea(objectId) {
        this.removeHighlight();

        const object = this.objects.find(obj => obj.id === objectId);
        if (!object) return;

        const overlay = document.getElementById('map-overlay');

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none';

        // Конвертируем абсолютные координаты в проценты
        const x1 = (object.coords[0] / this.mapWidth) * 100;
        const y1 = (object.coords[1] / this.mapHeight) * 100;
        const x2 = (object.coords[2] / this.mapWidth) * 100;
        const y2 = (object.coords[3] / this.mapHeight) * 100;
        const width = x2 - x1;
        const height = y2 - y1;

        const rectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rectElement.setAttribute('x', `${x1}%`);
        rectElement.setAttribute('y', `${y1}%`);
        rectElement.setAttribute('width', `${width}%`);
        rectElement.setAttribute('height', `${height}%`);
        rectElement.setAttribute('class', 'area-highlight');

        svg.appendChild(rectElement);
        overlay.appendChild(svg);
    }

    removeHighlight() {
        const overlay = document.getElementById('map-overlay');
        const svg = overlay.querySelector('svg');
        if (svg) {
            svg.remove();
        }
    }

    hidePopup() {
        document.getElementById('popup').style.display = 'none';
        this.removeHighlight();
        this.selectedObject = null;
    }

    filterItems(searchTerm, filterType = 'all') {
        const filteredObjects = this.objects.filter(obj =>
            obj.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (filterType === 'all' || filterType === 'location')
        );

        const filteredCharacters = this.characters.filter(char =>
            char.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (filterType === 'all' || filterType === 'character')
        );

        this.renderFilteredLists(filteredObjects, filteredCharacters);
    }

    renderFilteredLists(objects, characters) {
        const objectsContainer = document.getElementById('objects-container');
        const charactersContainer = document.getElementById('characters-container');

        objectsContainer.innerHTML = '';
        charactersContainer.innerHTML = '';

        objects.forEach(obj => {
            const li = document.createElement('li');
            li.textContent = obj.name;
            li.dataset.id = obj.id;
            li.addEventListener('click', () => this.showObjectDetails(obj));
            objectsContainer.appendChild(li);
        });

        characters.forEach(char => {
            const li = document.createElement('li');
            li.textContent = char.name;
            li.dataset.id = char.id;
            li.addEventListener('click', () => this.showCharacterDetails(char));
            charactersContainer.appendChild(li);
        });
    }
}

// Инициализация карты при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new InteractiveMap();
});