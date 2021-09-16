import mongoose from 'mongoose';

export interface IReservation extends mongoose.Document {
  dateFrom: Date;
  dateTo: Date;
  numberOfGuests: Number;
  price: Number;
  agency: 'booking' | 'airbnb' | 'expedia' | 'private' | 'other';
  unit: mongoose.Schema.Types.ObjectId;
  user: mongoose.Schema.Types.ObjectId;
}

const bookingSchema = new mongoose.Schema<IReservation>({
  dateFrom: { type: Date, required: true },
  dateTo: { type: Date, required: true },
  guestName: { type: String, required: true },
  numberOfGuests: { type: String, required: true },
  price: { type: Number, required: true },
  agency: {
    type: String,
    enum: ['booking', 'airbnb', 'expedia', 'private', 'other'],
  },
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    reqired: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    reqired: true,
  },
});

const Reservation = mongoose.model('Reservation', bookingSchema);

export default Reservation;
