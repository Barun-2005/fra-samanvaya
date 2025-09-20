const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');

dotenv.config({ path: '../../.env' });


const seedDB = async () => {
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    
  await User.deleteMany({});

  const superAdmin = new User({
    username: 'SuperAdmin',
    password: 'password',
    role: 'SuperAdmin',
  });

  await superAdmin.save();

  console.log('Database seeded');
  mongoose.connection.close();
};

seedDB();
