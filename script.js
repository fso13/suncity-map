class InteractiveMap {
    constructor() {
        this.objects = [];
        this.characters = [];
        this.selectedObject = null;
        this.clickHistory = [];
        this.maxHistoryItems = 8;
        this.mapWidth = 0;
        this.mapHeight = 0;
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.filteredObjects = [];
        this.filteredCharacters = [];
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
        this.applyFilter();
    }

    loadData() {
        try {
            if (typeof locations !== 'undefined') {
                this.objects = locations;
                console.log('Локации загружены:', this.objects.length);
            } else {
                console.warn('Локации не найдены, используем демо-данные');
                this.loadDemoLocations();
            }
            
            if (typeof characters !== 'undefined') {
                this.characters = characters;
                console.log('Персонажи загружены:', this.characters.length);
            } else {
                console.warn('Персонажи не найдены, используем демо-данные');
                this.loadDemoCharacters();
            }
            
            this.filteredObjects = [...this.objects];
            this.filteredCharacters = [...this.characters];
            
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            this.loadDemoData();
        }
    }

    // Основной метод фильтрации и отображения
    applyFilter() {
        const searchTerm = this.currentSearch.toLowerCase().trim();
        const filterType = this.currentFilter;
        
        // Фильтрация объектов
        this.filteredObjects = this.objects.filter(obj => 
            obj.name.toLowerCase().includes(searchTerm) &&
            (filterType === 'all' || filterType === 'location')
        );
        
        // Фильтрация персонажей
        this.filteredCharacters = this.characters.filter(char => 
            char.name.toLowerCase().includes(searchTerm) &&
            (filterType === 'all' || filterType === 'character')
        );
        
        // Обновляем списки
        this.renderLists();
        
        // Обновляем маркеры на карте
        this.renderMapMarkers();
    }

    renderMapMarkers() {
        if (this.mapWidth === 0 || this.mapHeight === 0) return;

        const overlay = document.getElementById('map-overlay');
        
        // Очищаем все маркеры
        const oldMarkers = overlay.querySelectorAll('.object-marker, .object-label, .character-marker, .character-label');
        oldMarkers.forEach(marker => marker.remove());
        
        // Убираем все классы видимости
        overlay.classList.remove('objects-visible', 'characters-visible', 'filter-active');
        
        // Если есть активный поиск или фильтр
        const hasActiveFilter = this.currentSearch.trim() !== '' || this.currentFilter !== 'all';
        
        if (hasActiveFilter) {
            overlay.classList.add('filter-active');
            
            // Показываем только отфильтрованные маркеры
            this.renderFilteredMarkers();
        } else {
            // Показываем все маркеры согласно текущему фильтру
            if (this.currentFilter === 'all' || this.currentFilter === 'location') {
                overlay.classList.add('objects-visible');
                this.renderObjects();
            }
            
            if (this.currentFilter === 'all' || this.currentFilter === 'character') {
                overlay.classList.add('characters-visible');
                this.renderCharacters();
            }
        }
    }

    renderFilteredMarkers() {
        const overlay = document.getElementById('map-overlay');
        
        // Показываем отфильтрованные объекты
        this.filteredObjects.forEach(obj => {
            this.createObjectMarker(obj, overlay);
        });
        
        // Показываем отфильтрованных персонажей
        this.filteredCharacters.forEach(char => {
            this.createCharacterMarker(char, overlay);
        });
    }

    renderObjects() {
        const overlay = document.getElementById('map-overlay');
        this.objects.forEach(obj => {
            this.createObjectMarker(obj, overlay);
        });
    }

    renderCharacters() {
        const overlay = document.getElementById('map-overlay');
        this.characters.forEach(char => {
            this.createCharacterMarker(char, overlay);
        });
    }

    createObjectMarker(obj, overlay) {
        if (!obj.center) return;
        
        const percentX = (obj.center[0] / this.mapWidth) * 100;
        const percentY = (obj.center[1] / this.mapHeight) * 100;
        
        // Маркер объекта
        const marker = document.createElement('div');
        marker.className = 'object-marker';
        marker.style.left = `${percentX}%`;
        marker.style.top = `${percentY}%`;
        marker.dataset.id = obj.id;
        
        // Надпись объекта (справа от маркера)
        const label = document.createElement('div');
        label.className = 'object-label';
        label.textContent = obj.name;
        label.style.left = `${percentX}%`;
        label.style.top = `${percentY}%`;
        
        // Обработчики событий
        marker.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showObjectDetails(obj);
        });
        
        label.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showObjectDetails(obj);
        });
        
        marker.addEventListener('mouseenter', () => this.highlightArea(obj.id));
        marker.addEventListener('mouseleave', () => this.removeHighlight());
        
        overlay.appendChild(marker);
        overlay.appendChild(label);
    }

    createCharacterMarker(character, overlay) {
        if (!character.center) return;
        
        const percentX = (character.center[0] / this.mapWidth) * 100;
        const percentY = (character.center[1] / this.mapHeight) * 100;
        
        // Маркер персонажа
        const marker = document.createElement('div');
        marker.className = 'character-marker';
        marker.style.left = `${percentX}%`;
        marker.style.top = `${percentY}%`;
        marker.dataset.id = character.id;
        marker.title = `${character.name}`;
        
        // Надпись персонажа (справа от маркера)
        const label = document.createElement('div');
        label.className = 'character-label';
        label.textContent = character.name;
        label.style.left = `${percentX}%`;
        label.style.top = `${percentY}%`;
        label.title = `${character.name} - ${character.description}`;
        
        // Обработчики событий
        const showCharacterInfo = (e) => {
            e.stopPropagation();
            this.showCharacterDetails(character);
        };
        
        marker.addEventListener('click', showCharacterInfo);
        label.addEventListener('click', showCharacterInfo);
        
        marker.addEventListener('mouseenter', () => this.highlightCharacter(character.id));
        marker.addEventListener('mouseleave', () => this.removeHighlight());
        label.addEventListener('mouseenter', () => this.highlightCharacter(character.id));
        label.addEventListener('mouseleave', () => this.removeHighlight());
        
        overlay.appendChild(marker);
        overlay.appendChild(label);
    }

    highlightCharacter(characterId) {
        this.removeHighlight();
        const character = this.characters.find(char => char.id === characterId);
        if (!character) return;
        const location = this.objects.find(obj => obj.id === character.locationId);
        if (location) this.highlightArea(location.id);
    }

    createMapAreas() {
        if (this.mapWidth === 0 || this.mapHeight === 0) return;

        const mapElement = document.getElementById('objectMap');
        mapElement.innerHTML = '';

        this.objects.forEach(obj => {
            const area = document.createElement('area');
            area.shape = 'rect';
            
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

        // Отслеживание координат
        mapWrapper.addEventListener('mousemove', (e) => {
            this.updateCursorCoordinates(e);
        });

        mapWrapper.addEventListener('click', (e) => {
            this.handleMapClick(e);
        });

        mapWrapper.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.handleRightClick(e);
        });

        // Поиск и фильтры
        const searchInput = document.getElementById('search');
        searchInput.addEventListener('input', (e) => {
            this.currentSearch = e.target.value;
            this.applyFilter();
        });

        const filterType = document.getElementById('filter-type');
        filterType.addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.applyFilter();
        });

        // Закрытие попапа
        document.querySelector('.close').addEventListener('click', () => {
            this.hidePopup();
        });

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('popup')) {
                this.hidePopup();
            }
        });

        window.addEventListener('resize', () => {
            this.renderMapMarkers();
        });
    }

    getAbsoluteCoordinates(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
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
    }

    handleRightClick(e) {
        e.preventDefault();
        if (this.mapWidth === 0 || this.mapHeight === 0) return;
        
        const coords = this.getAbsoluteCoordinates(e);
        this.showClickMarker(coords.screen.x, coords.screen.y);
        this.addToClickHistory(coords.absolute.x, coords.absolute.y, 'Правый клик');
    }

    showClickMarker(x, y) {
        const marker = document.getElementById('click-marker');
        marker.style.left = `${x}px`;
        marker.style.top = `${y}px`;
        marker.style.display = 'block';
        
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
        
        this.clickHistory.forEach((click, index) => {
            const item = document.createElement('div');
            item.className = 'click-item';
            item.innerHTML = `
                <strong>${click.timestamp}</strong><br>
                ${click.type}: X: ${click.x}, Y: ${click.y}
            `;
            
            item.addEventListener('click', () => {
                const rect = document.querySelector('.map-wrapper').getBoundingClientRect();
                const screenX = (click.x / this.mapWidth) * rect.width;
                const screenY = (click.y / this.mapHeight) * rect.height;
                this.showClickMarker(screenX, screenY);
            });
            
            historyContainer.appendChild(item);
        });
    }

    renderLists() {
        this.renderObjectsList();
        this.renderCharactersList();
    }

    renderObjectsList() {
        const container = document.getElementById('objects-container');
        container.innerHTML = '';

        this.filteredObjects.forEach(obj => {
            const li = document.createElement('li');
            li.textContent = obj.name;
            li.dataset.id = obj.id;
            li.addEventListener('click', () => {
                this.showObjectDetails(obj);
                this.highlightArea(obj.id);
            });
            container.appendChild(li);
        });
    }

    renderCharactersList() {
        const container = document.getElementById('characters-container');
        container.innerHTML = '';

        this.filteredCharacters.forEach(char => {
            const li = document.createElement('li');
            li.textContent = char.name;
            li.dataset.id = char.id;
            li.addEventListener('click', () => {
                this.showCharacterDetails(char);
                const location = this.objects.find(obj => obj.id === char.locationId);
                if (location) this.highlightArea(location.id);
            });
            container.appendChild(li);
        });
    }

    showObjectDetails(object) {
        this.selectedObject = object;
        
        const popup = document.getElementById('popup');
        document.getElementById('popup-title').textContent = object.name;
        document.getElementById('popup-description').textContent = object.description;
        
        popup.style.display = 'block';
        this.highlightArea(object.id);
    }

    showCharacterDetails(character) {
        const location = this.objects.find(obj => obj.id === character.locationId);
        
        const popup = document.getElementById('popup');
        document.getElementById('popup-title').textContent = character.name;
        document.getElementById('popup-description').textContent = 
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

    loadDemoLocations() {
        this.objects = [
            { 
                id: 1, 
                name: "Лесная область (демо)", 
                type: "location", 
                coords: [100, 100, 200, 200],
                description: "Темный загадочный лес", 
                center: [150, 150]
            }
        ];
    }

    loadDemoCharacters() {
        this.characters = [
            { 
                id: 1, 
                name: "Рыцарь (демо)", 
                type: "character", 
                locationId: 1, 
                description: "Храбрый защитник леса",
                center: [130, 140]
            }
        ];
    }

    loadDemoData() {
        this.loadDemoLocations();
        this.loadDemoCharacters();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new InteractiveMap();
});