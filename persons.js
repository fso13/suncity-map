var characters = [
    {
        id: 1,
        name: "Старый Маг Тельбран",
        type: "character",
        locationId: 5,
        description: "Бывший архивариус Гильдии Арканов, отстранённый за исследования запретных текстов о Бездне. Теперь живёт как отшельник-книгочей",
        offset: { x: 20, y: -10 }
    },
    {
        id: 2,
        name: "Верховный Инквизитор Каррик",
        type: "character",
        locationId: 8,
        description: "Глава Ордена Алого Рассвета, фанатичный и беспринципный служитель Этериуса",
        offset: { x: 15, y: -5 }
    },
    {
        id: 3,
        name: "Ярл Ульфрик Скай-Айс",
        type: "character",
        locationId: 9,
        description: "Военный лидер (херсир) клана Снежного Медведя, представитель Хаймрока в Солнцеграде",
        offset: { x: 15, y: -5 }
    }, {
        id: 4,
        name: "Сторож на Площади Ясного Неба",
        type: "character",
        locationId: 10,
        description: "Проведёт героев через опасные зоны за плату. Также может дать информацию о безопасных маршрутах.",
        offset: { x: 15, y: -5 }
    }, {
        id: 5,
        name: "Барни",
        type: "character",
        locationId: 1,
        description: "Владелец таверны «Пьяный Единорог»",
        offset: { x: 15, y: -5 }
    }, {
        id: 6,
        name: "Торгрен",
        type: "character",
        locationId: 2,
        description: "владелец оружейной «Сталь и Верность»",
        offset: { x: 15, y: -5 }
    }, {
        id: 7,
        name: "Старая Элоди",
        type: "character",
        locationId: 3,
        description: "владелица аптеки «Корни и Сны».",
        offset: { x: 15, y: -5 }
    }, {
        id: 8,
        name: "Мадам Изабель",
        type: "character",
        locationId: 4,
        description: "владелица гостиницы «Позолоченный Единорог»",
        offset: { x: 15, y: -5 }
    },

    {
        id: 9,
        name: "Аколит Элвин",
        type: "character",
        locationId: 5,
        description: "Аколит Золотого Молота",
        offset: { x: 15, y: -5 }
    },

    {
        id: 10,
        name: "Верховная жрица Алания",
        type: "character",
        locationId: 6,
        description: "верховная жрица небольшого святилища Сильваны в Солнцеграде",
        offset: { x: -20, y: -10 }
    }, {
        id: 11,
        name: "Жрец Элдервин",
        type: "character",
        locationId: 6,
        description: "Жрец Рощи Тихих Шёпотов",
        offset: { x: 15, y: -5 }
    },
    {
        id: 12,
        name: "Жрец Талос",
        type: "character",
        locationId: 7,
        description: "Верховный жрец храма Морвана в Солнцеграде",
       offset: { x: -20, y: -10 }
    },
    {
        id: 13,
        name: "Жрец Элдар",
        type: "character",
        locationId: 7,
        description: "Жрец Гавань Вечного Прилива",
        offset: { x: 15, y: -5 }
    },
];

// Экспортируем для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    // Для Node.js
    module.exports = characters;
} else {
    // Для браузера - добавляем в глобальную область видимости
    window.characters = characters;
}