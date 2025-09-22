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
        this.showCharacters = true;
        this.labelPositions = []; // Для отслеживания позиций надписей
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
        this.renderCharacterMarkers();
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
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            this.loadDemoData();
        }
    }

    getCharacterCoordinates(character) {
        const location = this.objects.find(obj => obj.id === character.locationId);
        if (!location || !location.center) return null;
        
        const locCenterX = location.center[0];
        const locCenterY = location.center[1];
        
        let baseOffsetX = character.offset?.x || 0;
        let baseOffsetY = character.offset?.y || 0;
        
        let charX = locCenterX + baseOffsetX;
        let charY = locCenterY + baseOffsetY;
        
        const margin = 15;
        charX = Math.max(location.coords[0] + margin, Math.min(location.coords[2] - margin, charX));
        charY = Math.max(location.coords[1] + margin, Math.min(location.coords[3] - margin, charY));
        
        return { x: charX, y: charY };
    }

    // Метод для получения оптимальной позиции надписи
    getLabelPosition(markerX, markerY, isCharacter = false) {
        // Размеры надписей (примерные)
        const labelWidth = isCharacter ? 60 : 80;
        const labelHeight = isCharacter ? 18 : 20;
        
        // Возможные позиции относительно маркера
        const positions = [
            { x: 0, y: -labelHeight - 8, name: 'top' },    // сверху
            { x: labelWidth/2 + 5, y: 0, name: 'right' },  // справа
            { x: 0, y: labelHeight + 8, name: 'bottom' },  // снизу
            { x: -labelWidth/2 - 5, y: 0, name: 'left' }   // слева
        ];
        
        // Для персонажей предпочитаем позицию снизу, для объектов - сверху
        const preferredIndex = isCharacter ? 2 : 0;
        
        // // Проверяем предпочтительную позицию сначала
        // if (this.isPositionAvailable(markerX + positions[preferredIndex].x, markerY + positions[preferredIndex].y, labelWidth, labelHeight)) {
        //     return positions[preferredIndex];
        // }
        
        // Если предпочтительная позиция занята, проверяем остальные
        for (let i = 0; i < positions.length; i++) {
            if (i !== preferredIndex && this.isPositionAvailable(markerX + positions[i].x, markerY + positions[i].y, labelWidth, labelHeight)) {
                return positions[i];
            }
        }
        
        // Если все позиции заняты, возвращаем предпочтительную
        return positions[preferredIndex];
    }

    // Проверяем, доступна ли позиция для надписи
    isPositionAvailable(x, y, width, height) {
        const padding = 10; // Отступ между надписями
        
        for (let existingPos of this.labelPositions) {
            if (this.checkOverlap(
                x - padding, y - padding, width + padding * 2, height + padding * 2,
                existingPos.x, existingPos.y, existingPos.width, existingPos.height
            )) {
                return false;
            }
        }
        return true;
    }

    // Проверка перекрытия двух прямоугольников
    checkOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 && 
               x1 + w1 > x2 && 
               y1 < y2 + h2 && 
               y1 + h1 > y2;
    }

    renderObjectMarkers() {
        if (this.mapWidth === 0 || this.mapHeight === 0) return;

        const overlay = document.getElementById('map-overlay');
        const oldMarkers = overlay.querySelectorAll('.object-marker, .object-label');
        oldMarkers.forEach(marker => marker.remove());
        
        this.labelPositions = []; // Сбрасываем позиции надписей
        
        if (this.isFilterActive) {
            overlay.classList.remove('objects-visible');
            return;
        }
        
        overlay.classList.add('objects-visible');
        
        this.objects.forEach(obj => {
            if (obj.center) {
                const percentX = (obj.center[0] / this.mapWidth) * 100;
                const percentY = (obj.center[1] / this.mapHeight) * 100;
                
                // Маркер объекта
                const marker = document.createElement('div');
                marker.className = 'object-marker';
                marker.style.left = `${percentX}%`;
                marker.style.top = `${percentY}%`;
                marker.dataset.id = obj.id;
                
                // Надпись объекта
                const label = document.createElement('div');
                label.className = 'object-label';
                label.textContent = obj.name;
                
                // Получаем оптимальную позицию для надписи
                const labelPos = this.getLabelPosition(percentX, percentY, false);
                const labelWidth = 80;
                const labelHeight = 20;
                
                label.style.left = `${percentX}%`;
                label.style.top = `${percentY}%`;
                label.style.transform = `translate(${labelPos.x}px, ${labelPos.y}px)`;
                
                // Сохраняем позицию надписи
                this.labelPositions.push({
                    x: percentX + labelPos.x,
                    y: percentY + labelPos.y,
                    width: labelWidth,
                    height: labelHeight,
                    type: 'object'
                });
                
                overlay.appendChild(marker);
                overlay.appendChild(label);
            }
        });
    }

    renderCharacterMarkers() {
        if (this.mapWidth === 0 || this.mapHeight === 0) return;

        const overlay = document.getElementById('map-overlay');
        const oldMarkers = overlay.querySelectorAll('.character-marker, .character-label');
        oldMarkers.forEach(marker => marker.remove());
        
        if (this.isFilterActive || !this.showCharacters) {
            overlay.classList.remove('characters-visible');
            return;
        }
        
        overlay.classList.add('characters-visible');
        
        this.characters.forEach(character => {
            const coords = this.getCharacterCoordinates(character);
            if (!coords) return;
            
            const percentX = (coords.x / this.mapWidth) * 100;
            const percentY = (coords.y / this.mapHeight) * 100;
            
            // Маркер персонажа
            const marker = document.createElement('div');
            marker.className = 'character-marker';
            marker.style.left = `${percentX}%`;
            marker.style.top = `${percentY}%`;
            marker.dataset.id = character.id;
            marker.title = `${character.name} (${this.getLocationName(character.locationId)})`;
            
            // Надпись персонажа
            const label = document.createElement('div');
            label.className = 'character-label';
            label.textContent = character.name;
            
            // Получаем оптимальную позицию для надписи
            const labelPos = this.getLabelPosition(percentX, percentY, true);
            const labelWidth = 60;
            const labelHeight = 18;
            
            label.style.left = `${percentX}%`;
            label.style.top = `${percentY}%`;
            label.style.transform = `translate(${labelPos.x}px, ${labelPos.y}px)`;
            label.title = `${character.name} - ${character.description}`;
            
            // Сохраняем позицию надписи
            this.labelPositions.push({
                x: percentX + labelPos.x,
                y: percentY + labelPos.y,
                width: labelWidth,
                height: labelHeight,
                type: 'character'
            });
            
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
        });
    }

    getLocationName(locationId) {
        const location = this.objects.find(obj => obj.id === locationId);
        return location ? location.name : 'Неизвестно';
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

        const searchInput = document.getElementById('search');
        searchInput.addEventListener('input', (e) => {
            this.handleFilterChange(e.target.value);
        });

        const filterType = document.getElementById('filter-type');
        filterType.addEventListener('change', (e) => {
            this.handleFilterChange(searchInput.value, e.target.value);
        });

        document.querySelector('.close').addEventListener('click', () => {
            this.hidePopup();
        });

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('popup')) {
                this.hidePopup();
            }
        });

        window.addEventListener('resize', () => {
            this.renderObjectMarkers();
            this.renderCharacterMarkers();
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
        
        console.log(`Абсолютные координаты клика: X: ${coords.absolute.x}, Y: ${coords.absolute.y}`);
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
                const rect = document.querySelector('.map-wrapper').getBoundingClientRect();
                const screenX = (click.x / this.mapWidth) * rect.width;
                const screenY = (click.y / this.mapHeight) * rect.height;
                this.showClickMarker(screenX, screenY);
            });
            
            historyContainer.appendChild(item);
        });
    }

    handleFilterChange(searchTerm, filterType = null) {
        if (!filterType) {
            filterType = document.getElementById('filter-type').value;
        }
        
        const hasSearch = searchTerm.trim().length > 0;
        const hasTypeFilter = filterType !== 'all';
        this.isFilterActive = hasSearch || hasTypeFilter;
        
        this.renderObjectMarkers();
        this.renderCharacterMarkers();
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

    loadDemoLocations() {
        this.objects = [
            { 
                id: 1, 
                name: "Лесная область (демо)", 
                type: "location", 
                coords: [100, 100, 200, 200],
                description: "Темный загадочный лес", 
                center: [150, 150]
            },
            { 
                id: 2, 
                name: "Горная вершина (демо)", 
                type: "location", 
                coords: [300, 50, 400, 150], 
                description: "Высокая гора с прекрасным видом", 
                center: [350, 100] 
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
                offset: { x: -20, y: -10 }
            },
            { 
                id: 2, 
                name: "Маг (демо)", 
                type: "character", 
                locationId: 2, 
                description: "Мудрый старец с гор",
                offset: { x: 15, y: -5 }
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