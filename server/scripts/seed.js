const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

const User = require('../src/models/User');
const Mess = require('../src/models/Mess');
const MenuItem = require('../src/models/MenuItem');
const Staff = require('../src/models/Staff');
const WasteLog = require('../src/models/WasteLog');
const Feedback = require('../src/models/Feedback');
const Inventory = require('../src/models/Inventory');
const EnergyLog = require('../src/models/EnergyLog');
const FoodListing = require('../src/models/FoodListing');
const FoodRequest = require('../src/models/FoodRequest');
const BioWasteListing = require('../src/models/BioWasteListing');
const BioWasteRequest = require('../src/models/BioWasteRequest');

const staffUsers = [
  { name: 'Ravi Kumar', email: 'ravi@mess.edu', password: 'staff123', role: 'staff' },
  { name: 'Priya Sharma', email: 'priya@mess.edu', password: 'staff456', role: 'staff' },
];

const studentUsers = [
  { name: 'Arjun Mehta', email: 'arjun@student.edu', password: 'stu123', role: 'student', rollNo: 'CS21B001', year: 3 },
  { name: 'Sneha Patel', email: 'sneha@student.edu', password: 'stu456', role: 'student', rollNo: 'EE21B042', year: 3 },
];

const ngoUsers = [
  {
    name: 'Helping Hands Foundation',
    organizationName: 'Helping Hands Foundation',
    email: 'ngo@helpinghands.org',
    password: 'ngo12345',
    role: 'ngo',
    location: 'Adyar, Chennai, Tamil Nadu',
    latitude: 12.9981,
    longitude: 80.2573,
  },
];

const bioUsers = [
  {
    name: 'PurpleFuel Biogas',
    organizationName: 'PurpleFuel Biogas',
    email: 'bio@purplefuel.org',
    password: 'bio12345',
    role: 'bio',
    location: 'Velachery, Chennai, Tamil Nadu',
    latitude: 12.9791,
    longitude: 80.2209,
  },
];

const seedMessLocation = {
  location: 'Hostel H4, IIT Campus, Chennai - 600036',
  latitude: 12.9918,
  longitude: 80.2337,
};

async function upsertUser(data) {
  const existing = await User.findOne({ email: data.email });
  if (!existing) return User.create(data);

  existing.name = data.name;
  existing.role = data.role;
  if (data.rollNo) existing.rollNo = data.rollNo;
  if (data.year) existing.year = data.year;
  existing.isSetupComplete = true;
  await existing.save();
  return existing;
}

async function seed() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI not found in server/.env');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const [adminUser, secondStaff] = await Promise.all(staffUsers.map(upsertUser));
  console.log('Upserted staff users');
  const [ngoUser] = await Promise.all(ngoUsers.map(upsertUser));
  console.log('Upserted NGO users');
  const [bioUser] = await Promise.all(bioUsers.map(upsertUser));
  console.log('Upserted BioLoop users');

  let mess = await Mess.findOne({ name: 'Hostel H4 Mess' });
  if (!mess) {
    mess = await Mess.create({
      name: 'Hostel H4 Mess',
      capacity: 500,
      established: 2010,
      phone: '9876543210',
      location: seedMessLocation.location,
      latitude: seedMessLocation.latitude,
      longitude: seedMessLocation.longitude,
      adminUserId: adminUser._id,
      adminContact: { name: 'Ravi Kumar', email: 'ravi@mess.edu', phone: '9876543210' },
      pointOfContact: { name: 'Mess Office', phone: '9876500000' },
      representative: { name: 'Ravi Kumar', email: 'ravi@mess.edu', phone: '9876543210' },
      isActive: true,
    });
    console.log('Created mess');
  } else {
    mess.adminUserId = adminUser._id;
    mess.isActive = true;
    mess.location = seedMessLocation.location;
    mess.latitude = seedMessLocation.latitude;
    mess.longitude = seedMessLocation.longitude;
    await mess.save();
    console.log('Updated mess');
  }

  const staffDocs = [adminUser, secondStaff];
  await Promise.all(
    staffDocs.map((u) => User.updateOne({ _id: u._id }, { $set: { messId: mess._id, isSetupComplete: true } })),
  );

  const students = [];
  for (const s of studentUsers) {
    const student = await upsertUser(s);
    student.messId = mess._id;
    student.isSetupComplete = true;
    await student.save();
    students.push(student);
  }
  console.log('Upserted student users');

  ngoUser.organizationName = ngoUsers[0].organizationName;
  ngoUser.location = ngoUsers[0].location;
  ngoUser.latitude = ngoUsers[0].latitude;
  ngoUser.longitude = ngoUsers[0].longitude;
  ngoUser.isSetupComplete = true;
  await ngoUser.save();

  bioUser.organizationName = bioUsers[0].organizationName;
  bioUser.location = bioUsers[0].location;
  bioUser.latitude = bioUsers[0].latitude;
  bioUser.longitude = bioUsers[0].longitude;
  bioUser.isSetupComplete = true;
  await bioUser.save();

  await Promise.all([
    MenuItem.deleteMany({ messId: mess._id }),
    Staff.deleteMany({ messId: mess._id }),
    WasteLog.deleteMany({ messId: mess._id }),
    Feedback.deleteMany({ messId: mess._id }),
    Inventory.deleteMany({ messId: mess._id }),
    EnergyLog.deleteMany({ messId: mess._id }),
    FoodListing.deleteMany({ messId: mess._id }),
    FoodRequest.deleteMany({ messId: mess._id }),
    BioWasteListing.deleteMany({ messId: mess._id }),
    BioWasteRequest.deleteMany({ messId: mess._id }),
  ]);
  console.log('Cleared old mess-linked sample data');

  const menuItems = await MenuItem.insertMany([
    { messId: mess._id, name: 'Chole Bhature', category: 'Main Course', avgWasteKg: 12, avgRating: 4.2 },
    { messId: mess._id, name: 'Dal Makhani', category: 'Main Course', avgWasteKg: 8, avgRating: 4.5 },
    { messId: mess._id, name: 'Kadhi Chawal', category: 'Main Course', avgWasteKg: 15, avgRating: 3.8 },
    { messId: mess._id, name: 'Rajma Rice', category: 'Main Course', avgWasteKg: 10, avgRating: 4.3 },
    { messId: mess._id, name: 'Veg Biryani', category: 'Main Course', avgWasteKg: 6, avgRating: 4.7 },
    { messId: mess._id, name: 'Paneer Butter Masala', category: 'Main Course', avgWasteKg: 5, avgRating: 4.8 },
    { messId: mess._id, name: 'Aloo Paratha', category: 'Breakfast', avgWasteKg: 3, avgRating: 4.4 },
    { messId: mess._id, name: 'Idli Sambar', category: 'Breakfast', avgWasteKg: 4, avgRating: 4.1 },
  ]);

  await Staff.insertMany([
    { messId: mess._id, name: 'Ramesh Yadav', role: 'Head Cook', contactNumber: '9876501111', speciality: 'North Indian', since: 2018 },
    { messId: mess._id, name: 'Suresh Kumar', role: 'Cook', contactNumber: '9876502222', speciality: 'South Indian', since: 2020 },
    { messId: mess._id, name: 'Mohan Das', role: 'Cook', contactNumber: '9876503333', speciality: 'Snacks', since: 2021 },
    { messId: mess._id, name: 'Lakshmi Devi', role: 'Helper', contactNumber: '9876504444', speciality: 'Chapati', since: 2019 },
    { messId: mess._id, name: 'Vijay Singh', role: 'Helper', contactNumber: '9876505555', speciality: 'Cleaning', since: 2022 },
  ]);

  await Inventory.insertMany([
    { messId: mess._id, name: 'Basmati Rice', category: 'Grains', quantity: 120, unit: 'kg', minQuantity: 50, costPerUnit: 80 },
    { messId: mess._id, name: 'Toor Dal', category: 'Legumes', quantity: 45, unit: 'kg', minQuantity: 30, costPerUnit: 120 },
    { messId: mess._id, name: 'Wheat Flour', category: 'Grains', quantity: 180, unit: 'kg', minQuantity: 50, costPerUnit: 35 },
    { messId: mess._id, name: 'Sunflower Oil', category: 'Oils', quantity: 40, unit: 'L', minQuantity: 20, costPerUnit: 150 },
    { messId: mess._id, name: 'Potatoes', category: 'Vegetables', quantity: 85, unit: 'kg', minQuantity: 20, costPerUnit: 25 },
    { messId: mess._id, name: 'Tomatoes', category: 'Vegetables', quantity: 30, unit: 'kg', minQuantity: 15, costPerUnit: 40 },
    { messId: mess._id, name: 'Onions', category: 'Vegetables', quantity: 60, unit: 'kg', minQuantity: 20, costPerUnit: 30 },
    { messId: mess._id, name: 'Milk', category: 'Dairy', quantity: 15, unit: 'L', minQuantity: 20, costPerUnit: 60 },
    { messId: mess._id, name: 'Paneer', category: 'Dairy', quantity: 8, unit: 'kg', minQuantity: 5, costPerUnit: 350 },
    { messId: mess._id, name: 'Cumin Seeds', category: 'Spices', quantity: 5, unit: 'kg', minQuantity: 2, costPerUnit: 200 },
  ]);

  const meals = ['Breakfast', 'Lunch', 'Dinner'];
  const wasteLogs = [];
  for (let d = 6; d >= 0; d -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    for (const meal of meals) {
      const item = menuItems[Math.floor(Math.random() * menuItems.length)];
      const wastedKg = Number((Math.random() * 15 + 2).toFixed(1));
      const preparedKg = Number((wastedKg * (5 + Math.random() * 3)).toFixed(1));
      wasteLogs.push({
        messId: mess._id,
        loggedBy: adminUser._id,
        date,
        meal,
        menuItemId: item._id,
        menuItemName: item.name,
        wastedKg,
        preparedKg,
        costLoss: Number((wastedKg * 40).toFixed(2)),
        co2Kg: Number((wastedKg * 2.5).toFixed(2)),
      });
    }
  }
  await WasteLog.insertMany(wasteLogs);

  const feedbackDocs = [];
  for (let i = 0; i < 12; i += 1) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 7));
    const student = students[i % students.length];
    feedbackDocs.push({
      messId: mess._id,
      studentId: student._id,
      date,
      meal: meals[i % meals.length],
      overallRating: Math.floor(Math.random() * 2) + 3,
      tasteRating: Math.floor(Math.random() * 2) + 3,
      portionRating: Math.floor(Math.random() * 2) + 3,
      freshnessRating: Math.floor(Math.random() * 2) + 3,
      comment: i % 3 === 0 ? 'Good food today.' : '',
    });
  }
  await Feedback.insertMany(feedbackDocs);

  const energyLogs = [];
  for (let d = 6; d >= 0; d -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const gasKg = Number((Math.random() * 10 + 5).toFixed(1));
    const electricityKwh = Number((Math.random() * 50 + 30).toFixed(1));
    energyLogs.push({
      messId: mess._id,
      loggedBy: adminUser._id,
      date,
      gasKg,
      electricityKwh,
      gasCost: Number((gasKg * 85).toFixed(2)),
      electricityCost: Number((electricityKwh * 8).toFixed(2)),
    });
  }
  await EnergyLog.insertMany(energyLogs);

  const listings = await FoodListing.insertMany([
    {
      messId: mess._id,
      createdBy: adminUser._id,
      foodCategory: 'Breakfast',
      foodItem: 'Aloo Paratha',
      quantityAvailableKg: 18,
      ratePerKg: 95,
      notes: 'Fresh surplus from breakfast service',
      isActive: true,
    },
    {
      messId: mess._id,
      createdBy: adminUser._id,
      foodCategory: 'Main Course',
      foodItem: 'Veg Biryani',
      quantityAvailableKg: 24,
      ratePerKg: 110,
      notes: 'Packed and available for NGO pickup',
      isActive: true,
    },
  ]);

  await FoodRequest.create({
    listingId: listings[0]._id,
    messId: mess._id,
    ngoId: ngoUser._id,
    requestedQtyKg: 8,
    ratePerKg: listings[0].ratePerKg,
    status: 'pending',
    isReadByMess: false,
    isReadByNgo: true,
  });

  const bioWasteListings = await BioWasteListing.insertMany([
    {
      messId: mess._id,
      createdBy: adminUser._id,
      wasteType: 'dumped_food',
      itemName: 'Mixed cooked rice waste',
      quantityAvailableKg: 30,
      ratePerKg: 28,
      notes: 'Collected from end-of-day service.',
      scheduledAt: new Date(Date.now() - 60 * 60 * 1000),
      activatedAt: new Date(Date.now() - 60 * 60 * 1000),
      availableUntil: new Date(Date.now() + 3 * 60 * 60 * 1000),
      status: 'active',
      isMarketplaceVisible: true,
    },
    {
      messId: mess._id,
      createdBy: adminUser._id,
      wasteType: 'expired_food',
      itemName: 'Expired bread and buns',
      quantityAvailableKg: 12,
      ratePerKg: 18,
      notes: 'Packaged bakery waste.',
      scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      status: 'scheduled',
      isMarketplaceVisible: false,
    },
  ]);

  await BioWasteRequest.create({
    listingId: bioWasteListings[0]._id,
    messId: mess._id,
    bioId: bioUser._id,
    requestedQtyKg: 12,
    offeredRatePerKg: 30,
    status: 'pending',
    isReadByMess: false,
    isReadByBio: true,
  });

  console.log('Seed complete');
  console.log('Staff login: ravi@mess.edu / staff123');
  console.log('Staff login: priya@mess.edu / staff456');
  console.log('Student login: arjun@student.edu / stu123');
  console.log('Student login: sneha@student.edu / stu456');
  console.log('NGO login: ngo@helpinghands.org / ngo12345');
  console.log('BioLoop login: bio@purplefuel.org / bio12345');
}

seed()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('Seed failed:', err.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  });
