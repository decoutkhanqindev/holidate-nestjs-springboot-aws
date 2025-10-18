// Test pagination và sorting cho RoomInventory
//
// 1. Test pagination:
// GET /api/accommodations/rooms/room-inventories?room-id=abc123&start-date=2025-01-01&end-date=2025-01-31&page=0&size=10
//
// 2. Test sorting by date (ascending):
// GET /api/accommodations/rooms/room-inventories?room-id=abc123&start-date=2025-01-01&end-date=2025-01-31&sort-by=date&sort-dir=asc
//
// 3. Test sorting by price (descending):
// GET /api/accommodations/rooms/room-inventories?room-id=abc123&start-date=2025-01-01&end-date=2025-01-31&sort-by=price&sort-dir=desc
//
// 4. Test sorting by available rooms:
// GET /api/accommodations/rooms/room-inventories?room-id=abc123&start-date=2025-01-01&end-date=2025-01-31&sort-by=availableRooms&sort-dir=asc
//
// 5. Test combined pagination and sorting:
// GET /api/accommodations/rooms/room-inventories?room-id=abc123&start-date=2025-01-01&end-date=2025-01-31&page=1&size=5&sort-by=price&sort-dir=desc

// Available sort fields:
// - date: Sort by inventory date
// - price: Sort by room price  
// - availableRooms: Sort by number of available rooms
// - status: Sort by room status

// Response format:
// {
// "data": {
// "content": [...], // Array of RoomInventoryResponse
// "page": 0,
// "size": 10,
// "totalElements": 31,
// "totalPages": 4,
// "first": true,
// "last": false,
// "numberOfElements": 10
// }
// }
