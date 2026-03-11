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

const demoEmails = [
  'ravi@mess.edu',
  'priya@mess.edu',
  'arjun@student.edu',
  'sneha@student.edu',
  'kavya@student.edu',
  'rohit@student.edu',
  'ngo@helpinghands.org',
  'bio@purplefuel.org',
];

const messConfigs = [
  {
    key: 'h4',
    name: 'Hostel H4 Mess',
    capacity: 500,
    established: 2010,
    phone: '9876543210',
    location: 'Hostel H4, IIT Madras, Chennai - 600036',
    latitude: 12.9918,
    longitude: 80.2337,
    bioLoopSettings: { dailyLogTime: '21:00' },
    adminContact: { name: 'Ravi Kumar', email: 'ravi@mess.edu', phone: '9876543210' },
    pointOfContact: { name: 'Ravi Kumar', phone: '9876543210' },
    representative: { name: 'Ravi Kumar', email: 'ravi@mess.edu', phone: '9876543210' },
    menu: [
      ['Aloo Paratha', 'Breakfast', 3.2, 4.4],
      ['Idli Sambar', 'Breakfast', 4.1, 4.2],
      ['Masala Dosa', 'Breakfast', 3.6, 4.5],
      ['Poha', 'Breakfast', 2.8, 4.0],
      ['Veg Biryani', 'Main Course', 6.4, 4.7],
      ['Dal Makhani', 'Main Course', 8.2, 4.6],
      ['Rajma Rice', 'Main Course', 10.1, 4.3],
      ['Paneer Butter Masala', 'Main Course', 5.3, 4.8],
    ],
    staff: [
      ['Ramesh Yadav', 'Head Cook', '9876501111', 'North Indian', 2018],
      ['Suresh Kumar', 'Cook', '9876502222', 'South Indian', 2020],
      ['Mohan Das', 'Cook', '9876503333', 'Bulk Cooking', 2021],
      ['Lakshmi Devi', 'Helper', '9876504444', 'Chapati Section', 2019],
      ['Vijay Singh', 'Store Keeper', '9876505555', 'Inventory Control', 2022],
    ],
    inventory: [
      ['Basmati Rice', 'Grains', 120, 'kg', 50, 82],
      ['Toor Dal', 'Legumes', 45, 'kg', 30, 124],
      ['Wheat Flour', 'Grains', 180, 'kg', 50, 36],
      ['Sunflower Oil', 'Oils', 40, 'L', 20, 152],
      ['Potatoes', 'Vegetables', 85, 'kg', 20, 26],
      ['Tomatoes', 'Vegetables', 34, 'kg', 15, 41],
      ['Onions', 'Vegetables', 58, 'kg', 20, 31],
      ['Milk', 'Dairy', 42, 'L', 20, 62],
      ['Paneer', 'Dairy', 12, 'kg', 5, 355],
      ['Cumin Seeds', 'Spices', 5, 'kg', 2, 205],
      ['Curd', 'Dairy', 28, 'kg', 10, 74],
      ['Green Peas', 'Vegetables', 18, 'kg', 8, 88],
    ],
    wasteSchedule: {
      Breakfast: ['Aloo Paratha', 'Idli Sambar', 'Masala Dosa', 'Poha'],
      Lunch: ['Veg Biryani', 'Dal Makhani', 'Rajma Rice', 'Paneer Butter Masala'],
      Dinner: ['Dal Makhani', 'Rajma Rice', 'Veg Biryani', 'Paneer Butter Masala'],
    },
    wasteBase: { Breakfast: 3.1, Lunch: 8.9, Dinner: 7.4 },
    energyBase: { gasKg: 8.4, electricityKwh: 54 },
    feedbackComments: [
      'Breakfast was warm and served on time.',
      'Paneer curry quality was excellent today.',
      'Portion size can be slightly higher during dinner.',
      'Good hygiene and fresh curd service.',
      'Rajma rice was popular, please repeat this menu more often.',
      'Queue moved faster than usual and staff was helpful.',
    ],
  },
  {
    key: 'lakeview',
    name: 'Lakeview Mess Block B',
    capacity: 420,
    established: 2014,
    phone: '9840011223',
    location: 'Taramani Link Road, Chennai - 600113',
    latitude: 12.9837,
    longitude: 80.2411,
    bioLoopSettings: { dailyLogTime: '20:30' },
    adminContact: { name: 'Priya Sharma', email: 'priya@mess.edu', phone: '9840011223' },
    pointOfContact: { name: 'Priya Sharma', phone: '9840011223' },
    representative: { name: 'Priya Sharma', email: 'priya@mess.edu', phone: '9840011223' },
    menu: [
      ['Poori Bhaji', 'Breakfast', 3.7, 4.3],
      ['Upma', 'Breakfast', 2.6, 4.0],
      ['Lemon Rice', 'Main Course', 5.9, 4.2],
      ['Curd Rice', 'Main Course', 4.8, 4.4],
      ['Chole Bhature', 'Main Course', 9.4, 4.5],
      ['Kadhi Chawal', 'Main Course', 7.2, 4.1],
      ['Veg Pulao', 'Main Course', 6.6, 4.3],
      ['Sambar Rice', 'Main Course', 5.4, 4.2],
    ],
    staff: [
      ['Anand Rao', 'Manager', '9840001010', 'Operations', 2017],
      ['Divya Nair', 'Head Cook', '9840002020', 'South Indian', 2019],
      ['Selvam M', 'Cook', '9840003030', 'Rice Dishes', 2021],
      ['Farida Begum', 'Assistant Cook', '9840004040', 'Breakfast', 2022],
      ['Karthik P', 'Helper', '9840005050', 'Service Counter', 2023],
    ],
    inventory: [
      ['Raw Rice', 'Grains', 140, 'kg', 60, 61],
      ['Besan', 'Grains', 25, 'kg', 10, 72],
      ['Curd', 'Dairy', 36, 'kg', 12, 78],
      ['Groundnut Oil', 'Oils', 34, 'L', 15, 166],
      ['Potatoes', 'Vegetables', 76, 'kg', 18, 25],
      ['Cabbage', 'Vegetables', 24, 'kg', 10, 28],
      ['Carrots', 'Vegetables', 22, 'kg', 10, 36],
      ['Green Chilies', 'Vegetables', 4, 'kg', 2, 90],
      ['Lemon', 'Vegetables', 12, 'kg', 5, 70],
      ['Mustard Seeds', 'Spices', 3, 'kg', 1, 160],
      ['Urad Dal', 'Legumes', 18, 'kg', 8, 126],
      ['Semolina', 'Grains', 30, 'kg', 12, 48],
    ],
    wasteSchedule: {
      Breakfast: ['Poori Bhaji', 'Upma', 'Poori Bhaji', 'Upma'],
      Lunch: ['Lemon Rice', 'Chole Bhature', 'Kadhi Chawal', 'Veg Pulao'],
      Dinner: ['Curd Rice', 'Sambar Rice', 'Veg Pulao', 'Kadhi Chawal'],
    },
    wasteBase: { Breakfast: 2.7, Lunch: 7.8, Dinner: 6.2 },
    energyBase: { gasKg: 7.6, electricityKwh: 48 },
    feedbackComments: [
      'Upma was light and fresh.',
      'Lunch tasted balanced and less oily.',
      'Curd rice was well chilled and popular.',
      'Dinner service was smooth even during rush hour.',
      'Would like a bit more spice in the sambar rice.',
      'Clean serving area and fast refill support.',
    ],
  },
];

const usersConfig = {
  staff: [
    { name: 'Ravi Kumar', email: 'ravi@mess.edu', password: 'staff123', role: 'staff', messKey: 'h4' },
    { name: 'Priya Sharma', email: 'priya@mess.edu', password: 'staff456', role: 'staff', messKey: 'lakeview' },
  ],
  students: [
    { name: 'Arjun Mehta', email: 'arjun@student.edu', password: 'stu123', role: 'student', rollNo: 'CS21B001', year: 3, messKey: 'h4' },
    { name: 'Sneha Patel', email: 'sneha@student.edu', password: 'stu456', role: 'student', rollNo: 'EE21B042', year: 3, messKey: 'lakeview' },
    { name: 'Kavya Iyer', email: 'kavya@student.edu', password: 'stu789', role: 'student', rollNo: 'ME22B017', year: 2, messKey: 'h4' },
    { name: 'Rohit Nair', email: 'rohit@student.edu', password: 'stu321', role: 'student', rollNo: 'CE22B011', year: 2, messKey: 'lakeview' },
  ],
  ngo: {
    name: 'Helping Hands Foundation',
    organizationName: 'Helping Hands Foundation',
    email: 'ngo@helpinghands.org',
    password: 'ngo12345',
    role: 'ngo',
    location: 'Adyar, Chennai, Tamil Nadu',
    latitude: 12.9981,
    longitude: 80.2573,
  },
  bio: {
    name: 'PurpleFuel Biogas',
    organizationName: 'PurpleFuel Biogas',
    email: 'bio@purplefuel.org',
    password: 'bio12345',
    role: 'bio',
    location: 'Velachery, Chennai, Tamil Nadu',
    latitude: 12.9791,
    longitude: 80.2209,
  },
};

function dateAtDaysAgo(daysAgo, hour, minute = 0) {
  const date = new Date();
  date.setSeconds(0, 0);
  date.setHours(hour, minute, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date;
}

function buildWasteLogs({ mess, adminUser, menuByName, schedule, wasteBase }) {
  const mealTimes = { Breakfast: 8, Lunch: 13, Dinner: 20 };
  const logs = [];
  for (let daysAgo = 13; daysAgo >= 0; daysAgo -= 1) {
    for (const meal of ['Breakfast', 'Lunch', 'Dinner']) {
      const itemNames = schedule[meal];
      const itemName = itemNames[daysAgo % itemNames.length];
      const menuItem = menuByName[itemName];
      const variance = ((13 - daysAgo) % 4) * 0.7;
      const wastedKg = Number((wasteBase[meal] + variance + (meal === 'Lunch' ? 1.1 : 0)).toFixed(1));
      const preparedFactor = meal === 'Breakfast' ? 6.2 : meal === 'Lunch' ? 5.7 : 5.4;
      const preparedKg = Number((wastedKg * preparedFactor).toFixed(1));
      logs.push({
        messId: mess._id,
        loggedBy: adminUser._id,
        date: dateAtDaysAgo(daysAgo, mealTimes[meal]),
        meal,
        menuItemId: menuItem._id,
        menuItemName: menuItem.name,
        wastedKg,
        preparedKg,
      });
    }
  }
  return logs;
}

function buildEnergyLogs({ mess, adminUser, energyBase }) {
  const logs = [];
  for (let daysAgo = 13; daysAgo >= 0; daysAgo -= 1) {
    logs.push({
      messId: mess._id,
      loggedBy: adminUser._id,
      date: dateAtDaysAgo(daysAgo, 22),
      gasKg: Number((energyBase.gasKg + ((13 - daysAgo) % 5) * 0.6).toFixed(1)),
      electricityKwh: Number((energyBase.electricityKwh + ((13 - daysAgo) % 4) * 3.5).toFixed(1)),
    });
  }
  return logs;
}

function buildFeedbackDocs({ mess, students, comments }) {
  const meals = ['Breakfast', 'Lunch', 'Dinner'];
  const docs = [];
  for (let i = 0; i < 12; i += 1) {
    const student = students[i % students.length];
    docs.push({
      messId: mess._id,
      studentId: student._id,
      date: dateAtDaysAgo(i % 10, 21),
      meal: meals[i % meals.length],
      overallRating: [5, 4, 4, 5, 3, 4][i % 6],
      tasteRating: [5, 4, 4, 5, 3, 4][i % 6],
      portionRating: [4, 4, 5, 4, 3, 4][i % 6],
      freshnessRating: [5, 4, 4, 5, 4, 4][i % 6],
      comment: comments[i % comments.length],
    });
  }
  return docs;
}

async function clearExistingDemoData() {
  await Promise.all([
    BioWasteRequest.deleteMany({}),
    BioWasteListing.deleteMany({}),
    FoodRequest.deleteMany({}),
    FoodListing.deleteMany({}),
    WasteLog.deleteMany({}),
    Feedback.deleteMany({}),
    Inventory.deleteMany({}),
    Staff.deleteMany({}),
    MenuItem.deleteMany({}),
    EnergyLog.deleteMany({}),
    Mess.deleteMany({ name: { $in: messConfigs.map((mess) => mess.name) } }),
    User.deleteMany({ email: { $in: demoEmails } }),
  ]);
}

async function seed() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI not found in server/.env');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  await clearExistingDemoData();
  console.log('Cleared existing demo data');

  const staffUsers = {};
  for (const config of usersConfig.staff) {
    staffUsers[config.messKey] = await User.create({
      name: config.name,
      email: config.email,
      password: config.password,
      role: config.role,
      isSetupComplete: true,
    });
  }

  const messes = {};
  for (const messConfig of messConfigs) {
    const adminUser = staffUsers[messConfig.key];
    messes[messConfig.key] = await Mess.create({
      name: messConfig.name,
      capacity: messConfig.capacity,
      established: messConfig.established,
      phone: messConfig.phone,
      location: messConfig.location,
      latitude: messConfig.latitude,
      longitude: messConfig.longitude,
      adminUserId: adminUser._id,
      adminContact: messConfig.adminContact,
      pointOfContact: messConfig.pointOfContact,
      representative: messConfig.representative,
      bioLoopSettings: messConfig.bioLoopSettings,
      isActive: true,
    });

    adminUser.messId = messes[messConfig.key]._id;
    adminUser.isSetupComplete = true;
    await adminUser.save();
  }

  const ngoUser = await User.create({ ...usersConfig.ngo, isSetupComplete: true });
  const bioUser = await User.create({ ...usersConfig.bio, isSetupComplete: true });

  const studentsByMess = { h4: [], lakeview: [] };
  for (const studentConfig of usersConfig.students) {
    const student = await User.create({
      name: studentConfig.name,
      email: studentConfig.email,
      password: studentConfig.password,
      role: studentConfig.role,
      rollNo: studentConfig.rollNo,
      year: studentConfig.year,
      messId: messes[studentConfig.messKey]._id,
      isSetupComplete: true,
    });
    studentsByMess[studentConfig.messKey].push(student);
  }

  const menuItemsByMess = {};
  for (const messConfig of messConfigs) {
    const menuItems = await MenuItem.insertMany(
      messConfig.menu.map(([name, category, avgWasteKg, avgRating]) => ({
        messId: messes[messConfig.key]._id,
        name,
        category,
        avgWasteKg,
        avgRating,
        isActive: true,
      })),
    );
    menuItemsByMess[messConfig.key] = Object.fromEntries(menuItems.map((item) => [item.name, item]));
  }

  for (const messConfig of messConfigs) {
    await Staff.insertMany(
      messConfig.staff.map(([name, role, contactNumber, speciality, since]) => ({
        messId: messes[messConfig.key]._id,
        name,
        role,
        contactNumber,
        speciality,
        since,
        isActive: true,
      })),
    );

    await Inventory.insertMany(
      messConfig.inventory.map(([name, category, quantity, unit, minQuantity, costPerUnit]) => ({
        messId: messes[messConfig.key]._id,
        name,
        category,
        quantity,
        unit,
        minQuantity,
        costPerUnit,
      })),
    );

    await WasteLog.insertMany(
      buildWasteLogs({
        mess: messes[messConfig.key],
        adminUser: staffUsers[messConfig.key],
        menuByName: menuItemsByMess[messConfig.key],
        schedule: messConfig.wasteSchedule,
        wasteBase: messConfig.wasteBase,
      }),
    );

    await EnergyLog.insertMany(
      buildEnergyLogs({
        mess: messes[messConfig.key],
        adminUser: staffUsers[messConfig.key],
        energyBase: messConfig.energyBase,
      }),
    );

    await Feedback.insertMany(
      buildFeedbackDocs({
        mess: messes[messConfig.key],
        students: studentsByMess[messConfig.key],
        comments: messConfig.feedbackComments,
      }),
    );
  }

  const foodListings = await FoodListing.insertMany([
    {
      messId: messes.h4._id,
      createdBy: staffUsers.h4._id,
      foodCategory: 'Breakfast',
      foodItem: 'Aloo Paratha',
      quantityAvailableKg: 18,
      ratePerKg: 95,
      notes: 'Fresh surplus from breakfast service, packed for quick NGO pickup.',
      availableUntil: new Date(Date.now() + 20 * 60 * 1000),
      isActive: true,
    },
    {
      messId: messes.h4._id,
      createdBy: staffUsers.h4._id,
      foodCategory: 'Main Course',
      foodItem: 'Veg Biryani',
      quantityAvailableKg: 24,
      ratePerKg: 110,
      notes: 'Sealed lunch surplus with serving trays ready.',
      availableUntil: new Date(Date.now() + 20 * 60 * 1000),
      isActive: true,
    },
    {
      messId: messes.h4._id,
      createdBy: staffUsers.h4._id,
      foodCategory: 'Main Course',
      foodItem: 'Rajma Rice',
      quantityAvailableKg: 16,
      ratePerKg: 88,
      notes: 'Expired NGO listing kept for BioLoop auto-tracker demo.',
      availableUntil: new Date(Date.now() - 10 * 60 * 1000),
      expiredAt: new Date(Date.now() - 9 * 60 * 1000),
      isActive: false,
    },
    {
      messId: messes.lakeview._id,
      createdBy: staffUsers.lakeview._id,
      foodCategory: 'Breakfast',
      foodItem: 'Poori Bhaji',
      quantityAvailableKg: 14,
      ratePerKg: 82,
      notes: 'Packed breakfast surplus for nearby partners.',
      availableUntil: new Date(Date.now() + 20 * 60 * 1000),
      isActive: true,
    },
    {
      messId: messes.lakeview._id,
      createdBy: staffUsers.lakeview._id,
      foodCategory: 'Main Course',
      foodItem: 'Veg Pulao',
      quantityAvailableKg: 20,
      ratePerKg: 102,
      notes: 'Dinner surplus ready for pickup.',
      availableUntil: new Date(Date.now() + 20 * 60 * 1000),
      isActive: true,
    },
  ]);

  await FoodRequest.insertMany([
    {
      listingId: foodListings[0]._id,
      messId: messes.h4._id,
      ngoId: ngoUser._id,
      requestedQtyKg: 8,
      ratePerKg: 95,
      status: 'pending',
      isReadByMess: false,
      isReadByNgo: true,
    },
    {
      listingId: foodListings[4]._id,
      messId: messes.lakeview._id,
      ngoId: ngoUser._id,
      requestedQtyKg: 10,
      ratePerKg: 102,
      status: 'accepted',
      isReadByMess: true,
      isReadByNgo: false,
      decidedAt: new Date(Date.now() - 90 * 60 * 1000),
    },
    {
      listingId: foodListings[1]._id,
      messId: messes.h4._id,
      ngoId: ngoUser._id,
      requestedQtyKg: 12,
      ratePerKg: 110,
      status: 'completed',
      isReadByMess: true,
      isReadByNgo: false,
      decidedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
  ]);

  const bioWasteListings = await BioWasteListing.insertMany([
    {
      messId: messes.h4._id,
      createdBy: staffUsers.h4._id,
      wasteType: 'biodegradable_waste',
      itemName: 'Biodegradable Waste',
      autoTrackedExpiredKg: 16,
      manualDumpedKg: 9,
      quantityAvailableKg: 25,
      ratePerKg: 30,
      notes: 'Combination of expired NGO surplus and kitchen dumped waste.',
      scheduledAt: new Date(Date.now() - 70 * 60 * 1000),
      activatedAt: new Date(Date.now() - 70 * 60 * 1000),
      availableUntil: new Date(Date.now() + 3 * 60 * 60 * 1000),
      status: 'active',
      isMarketplaceVisible: true,
    },
    {
      messId: messes.lakeview._id,
      createdBy: staffUsers.lakeview._id,
      wasteType: 'biodegradable_waste',
      itemName: 'Biodegradable Waste',
      autoTrackedExpiredKg: 0,
      manualDumpedKg: 14,
      quantityAvailableKg: 14,
      ratePerKg: 24,
      notes: 'Scheduled batch for evening biogas pickup.',
      scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      status: 'scheduled',
      isMarketplaceVisible: false,
    },
    {
      messId: messes.h4._id,
      createdBy: staffUsers.h4._id,
      wasteType: 'biodegradable_waste',
      itemName: 'Biodegradable Waste',
      autoTrackedExpiredKg: 11,
      manualDumpedKg: 7,
      quantityAvailableKg: 18,
      ratePerKg: 28,
      notes: 'Accepted by plant, awaiting pickup completion.',
      scheduledAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      activatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      availableUntil: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'accepted',
      isMarketplaceVisible: false,
    },
    {
      messId: messes.lakeview._id,
      createdBy: staffUsers.lakeview._id,
      wasteType: 'biodegradable_waste',
      itemName: 'Biodegradable Waste',
      autoTrackedExpiredKg: 6,
      manualDumpedKg: 6,
      quantityAvailableKg: 12,
      ratePerKg: 26,
      notes: 'Completed previous-day BioLoop pickup.',
      scheduledAt: new Date(Date.now() - 28 * 60 * 60 * 1000),
      activatedAt: new Date(Date.now() - 28 * 60 * 60 * 1000),
      availableUntil: new Date(Date.now() - 24 * 60 * 60 * 1000),
      finalizedAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
      status: 'completed',
      isMarketplaceVisible: false,
    },
  ]);

  await BioWasteRequest.insertMany([
    {
      listingId: bioWasteListings[0]._id,
      messId: messes.h4._id,
      bioId: bioUser._id,
      requestedQtyKg: 25,
      offeredRatePerKg: 32,
      status: 'pending',
      isReadByMess: false,
      isReadByBio: true,
    },
    {
      listingId: bioWasteListings[2]._id,
      messId: messes.h4._id,
      bioId: bioUser._id,
      requestedQtyKg: 18,
      offeredRatePerKg: 29,
      status: 'accepted',
      isReadByMess: true,
      isReadByBio: false,
      decidedAt: new Date(Date.now() - 45 * 60 * 1000),
    },
    {
      listingId: bioWasteListings[3]._id,
      messId: messes.lakeview._id,
      bioId: bioUser._id,
      requestedQtyKg: 12,
      offeredRatePerKg: 26,
      status: 'completed',
      isReadByMess: true,
      isReadByBio: false,
      decidedAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
    },
  ]);

  console.log('Seed complete');
  console.log('Staff login: ravi@mess.edu / staff123');
  console.log('Staff login: priya@mess.edu / staff456');
  console.log('Student login: arjun@student.edu / stu123');
  console.log('Student login: sneha@student.edu / stu456');
  console.log('Student login: kavya@student.edu / stu789');
  console.log('Student login: rohit@student.edu / stu321');
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
