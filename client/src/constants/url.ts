export const URL_PATH = Object.freeze({
  HOME: '/',
  INIT_ROOM: '/init-room',
  JOIN_ROOM: '/room',
  FAIL_CREATE_ROOM: '/fail-create-room',
  INVALID_ROOM: '/error/invalid-room',
  INTERNAL_SERVER_ERROR: '/error/internal-server',
});

export const API_URL = Object.freeze({
  // ROOM 관련
  CREATE_ROOM: '/api/room',
  VALID_ROOM: '/api/room/valid',

  // MAP 관련
  DRIVING_INFO: '/api/map/driving',
});
