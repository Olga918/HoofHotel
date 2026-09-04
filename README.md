# HoofHotel

**Найди ночлег. Без лишней скачки.**

Учебный Booking MVP команды **LameHorse**.

## Стек
| Часть | Технология |
|--------|------------|
| Мобилка | Expo (React Native) → `mobile/` |
| Backend | ASP.NET Web API → `api/` |
| БД | PostgreSQL + EF Core (Npgsql) |
| Дизайн | Figma |
| Задачи | [Trello LameHorse](https://trello.com/invite/b/6a91c24cb97e300fd1ad6033/ATTI7f82e6a4371a511b7131f39759b6dd85E50513C8/lamehorse) |
| Код | https://github.com/Olga918/HoofHotel |

## Команда
1. **Фелиппова Ольга** — Backend + Database + часть Frontend (тимлид)
2. **Анастасия** — Frontend + презентация

## MVP
1. Логин / регистрация
2. Поиск отелей (город)
3. Список + карточка отеля
4. Бронирование
5. Мои брони

Без оплаты, карт, чата и отдельной админки на первом этапе.

Тема: лёгкий юмор в названиях отелей; логика бронирования обычная.

## Структура
```
HoofHotel/
  mobile/
  api/
  README.md
```

## Схема БД
**Users** — Id, Email, PasswordHash, DisplayName, CreatedAt  
**Hotels** — Id, Name, City, Country, Description, PricePerNight, Rating, ImageUrl, Address  
**Bookings** — Id, UserId, HotelId, CheckIn, CheckOut, Guests, TotalPrice, Status, CreatedAt

## API
| Метод | URL | Описание |
|--------|-----|----------|
| GET | `/api/health` | Статус API |
| GET | `/api/hotels` | Список (`?city=Київ`) |
| GET | `/api/hotels/{id}` | Детали отеля |

Планируется: `/api/auth/register`, `/api/auth/login`, `/api/bookings`.

### Запуск
```powershell
cd api
dotnet run --launch-profile http

cd mobile
npm start
```

Локальная БД: PostgreSQL, база `hoofhotel`.  
Строка подключения — в `api/appsettings.Development.json` (файл не коммитить с паролем).

## Trello (ориентир)
- Auth JWT
- Список отелей из API
- Карточка отеля
- Создание брони
- Мои брони
- UI по Figma
- Демо для защиты
