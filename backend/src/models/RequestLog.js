import mongoose from 'mongoose';

const requestLogSchema = new mongoose.Schema(
  {
    ipAddress: {
      type: String,
      required: true,
    },
    endpoint: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['success', 'failure', 'suspicious'],
      required: true,
    },
    reason: {
      type: String,
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      expire: 2592000, // Auto-delete logs after 30 days
    },
  },
  {
    collection: 'request_logs',
  }
);

export default mongoose.model('RequestLog', requestLogSchema);
