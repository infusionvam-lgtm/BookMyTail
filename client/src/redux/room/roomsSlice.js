import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchRoomsAPI,
  fetchRoomByIdAPI,
  createRoomAPI,
  updateRoomAPI,
  deleteRoomAPI,
} from "./roomAPI.js";

const getToday = () => new Date().toISOString().split("T")[0];
const getTomorrow = () => {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  return t.toISOString().split("T")[0];
};

// ---------- Thunks ----------
export const fetchRooms = createAsyncThunk(
  "rooms/fetchRooms",
  async ({ checkIn, checkOut, guests, adminView = false }) => {
    const data = await fetchRoomsAPI({ checkIn, checkOut, guests,adminView });
    return data;
  }
);

export const fetchRoomById = createAsyncThunk(
  "rooms/fetchRoomById",
  async ({ id, checkIn, checkOut }) => {
    const data = await fetchRoomByIdAPI({ id, checkIn, checkOut });
    return data;
  }
);

export const createRoom = createAsyncThunk(
  "rooms/createRoom",
  async (formData) => {
    const data = await createRoomAPI(formData);
    return data.room; // API returns { message, room }
  }
);

export const updateRoom = createAsyncThunk(
  "rooms/updateRoom",
  async ({ id, formData }) => {
    const data = await updateRoomAPI({ id, updates: formData });
    return data.room;
  }
);

export const deleteRoom = createAsyncThunk(
  "rooms/deleteRoom",
  async ({ id, count }) => {
    const data = await deleteRoomAPI(id, count);
    return { id, ...data };
  }
);

// ---------- Slice ----------
const initialState = {
  checkIn: getToday(),
  checkOut: getTomorrow(),
  guests: 1,
  price: "",
  rooms: [],
  selectedRooms: [],
  selectedRoom: null,      // <-- Selected room for modal
  modalOpen: false,  
  loading: false,
  error: null,
};

const roomSlice = createSlice({
  name: "rooms",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      const { checkIn, checkOut, guests, price } = action.payload;
      state.checkIn = checkIn;
      state.checkOut = checkOut;
      state.guests = guests;
      state.price = price;
    },
    updateFilterField: (state, action) => {
      const { field, value } = action.payload;
      state[field] = value;
    },
    toggleRoomSelection: (state, action) => {
      const { roomType, count = 1 } = action.payload;
      const exists = state.selectedRooms.find((r) => r.roomType === roomType);

      if (exists) {
        state.selectedRooms = state.selectedRooms.filter(
          (r) => r.roomType !== roomType
        );
      } else {
        state.selectedRooms.push({ roomType, count });
      }
    },
    updateRoomCount: (state, action) => {
      const { roomId, count } = action.payload;
      const room = state.selectedRooms.find((r) => r.roomType === roomId);
      if (room) room.count = count;
    },
    syncSelectedFromCart: (state, action) => {
      state.selectedRooms = (action.payload.rooms || []).map((r) => ({
        roomType: r.roomType._id ?? r.roomType,
        count: r.count ?? 1,
      }));
    },
    resetFilters: (state) => {
      state.checkIn = getToday();
      state.checkOut = getTomorrow();
      state.guests = 1;
      state.price = "";
      state.selectedRooms = [];
    },
        openRoomModal: (state, action) => {
      state.selectedRoom = action.payload;
      state.modalOpen = true;
    },
    closeRoomModal: (state) => {
      state.modalOpen = false;
      state.selectedRoom = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
.addCase(fetchRooms.fulfilled, (state, action) => {
  const isAdmin =
    action.meta.arg?.adminView === true ||
    action.meta.arg?.adminView === "true";
  state.loading = false;

  // extract rooms array from payload
  const roomsArray = action.payload.rooms || [];

  state.rooms = roomsArray.map((room) => ({
    ...room,
    disabled: !isAdmin && room.availableRooms <= 0,
  }));

  // store totalRooms for pagination
  state.totalRooms = action.payload.totalRooms || roomsArray.length;
})
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch rooms";
      })
      .addCase(fetchRoomById.fulfilled, (state, action) => {
        const room = action.payload;
        const index = state.rooms.findIndex((r) => r._id === room._id);
        if (index !== -1) state.rooms[index] = room;
        else state.rooms.push(room);
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.rooms.push(action.payload);
      })
      .addCase(updateRoom.fulfilled, (state, action) => {
        const idx = state.rooms.findIndex((r) => r._id === action.payload._id);
        if (idx !== -1) state.rooms[idx] = action.payload;
      })
      .addCase(deleteRoom.fulfilled, (state, action) => {
        state.rooms = state.rooms.filter((r) => r._id !== action.payload.id);
      });
  },
});

export const {
  setFilters,
  updateFilterField,
  resetFilters,
  updateRoomCount,
  syncSelectedFromCart,
  toggleRoomSelection,
  openRoomModal, 
  closeRoomModal
} = roomSlice.actions;

export default roomSlice.reducer;
