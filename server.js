import { connect } from 'mongoose';
import User from './models/user.js';

connect('mongodb://localhost:27017/sharesquare', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ Connected to MongoDB');

  // Insert sample user
  const sampleUser = new User({
    name: 'Test User',
    email: 'test@example.com',
    password: '123456'
  });

  await sampleUser.save();
  console.log('✅ Sample user inserted');
})
.catch((err) => console.error('❌ Connection error:', err));
